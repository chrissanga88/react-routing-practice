import { useNavigate, Form, useNavigation, useActionData, redirect } from 'react-router-dom';

import classes from './EventForm.module.css';

function EventForm({ method, event }) {
  // gives us access to the data returned by our action. In this case the data would be the data returned on the backend in case of validation errors, which would be an object with a message and a nested errors object, which has different keys for the different form inputs and includes more detailed error messages
  const data = useActionData();
  const navigate = useNavigate();
  // the useNavigation hook can be used to extract data that was submitted as well as find out what the current state of the currently active transition is when the form is submitted. So in this case we can see if the data submission as already been completed
  const navigation = useNavigation();

  // if this is true, we know that action that was triggered is currently still active. this allows us to disable the save button to prevent multiple submissions
  const isSubmitting = navigation.state === 'submitting';

  function cancelHandler() {
    navigate('..');
  }

  // It's important to inlcude at name for each form input.
  // The Form tag will make sure that the browser default of sending a request to the backend will be omitted but it will take the request that would have been sent and give it to the action
  return (
    <Form method={method} className={classes.form}>
      {data && data.errors && <ul>
          {Object.values(data.errors).map(err => <li key={err}>{err}</li>)}
        </ul>}
      <p>
        <label htmlFor="title">Title</label>
        <input id="title" type="text" name="title" required defaultValue={event ? event.title : ''} />
      </p>
      <p>
        <label htmlFor="image">Image</label>
        <input id="image" type="url" name="image" required defaultValue={event ? event.image : ''} />
      </p>
      <p>
        <label htmlFor="date">Date</label>
        <input id="date" type="date" name="date" required defaultValue={event ? event.date : ''} />
      </p>
      <p>
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows="5" required defaultValue={event ? event.description : ''} />
      </p>
      <div className={classes.actions}>
        <button type="button" onClick={cancelHandler} disabled={isSubmitting}>
          Cancel
        </button>
        <button disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Save'}</button>
      </div>
    </Form>
  );
}

export default EventForm;

export async function action({request, params}) {
  const method = request.method;
  const data = await request.formData();

  const eventData = {
    title: data.get('title'),
    image: data.get('image'),
    date: data.get('date'),
    description: data.get('description'),
  }

  let url = 'http://localhost:8080/events';

  if (method === 'PATCH') {
    const eventId = params.eventId;
    url = 'http://localhost:8080/events/' + eventId;
  }

  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  });

  // will return the resonse from the backend if validation errors were detected
  if (response.status === 422) {
    return response;
  }

  if (!response.ok) {
    throw new Response(JSON.stringify({message: 'Could not save event.'}), { status: 500 });
  }

  // allows you to specify a path where you want to redirect the user
  return redirect('/events');
}