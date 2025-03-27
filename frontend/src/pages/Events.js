import { useLoaderData, Await } from 'react-router-dom';

import EventsList from '../components/EventsList';
import { Suspense } from 'react';

function EventsPage() {
  const { events } = useLoaderData();

  // The Await component in react-router-dom has a special resolve prop which wants one of our deferred values as a value. In this case the events key holds a promise that we want to pass to the resovle value of the await component. The await component will wait for that data to be there, then execute the function that passes the loaded events to the EventsList component. The suspense component, which is imported from react rather than react-router-dom, can be used in certain situations to show a fallback while we are waiting for other data to arrive. So here "Loading..." will be displayed while the events data is fetched
  return (
    <Suspense fallback={<p style={{textAlign: 'center'}}>Loading...</p>}>
      <Await resolve={events}>
        {(loadedEvents) => <EventsList events={loadedEvents} />}
      </Await>
    </Suspense>
  );
}

export default EventsPage;

// Moving this function out of the loader allows us to defer loading the events so the page loads without them then populates the events when the data is sent from the backend
async function loadEvents() {
  const response = await fetch('http://localhost:8080/events');

  if (!response.ok) {
    //return { isError: true, message: 'Could not fetch events.' };
    throw new Response(JSON.stringify({message: 'Could not fetch events.'}), {status: 500,});
  } else {
    // this has to be manually parsed instead of returning a response because of the deferred step in between the loader and useLoaderData
    const resData = await response.json();
    return resData.events;
  }
}

// It's a best practice to include the loader code in the file where it's needed as opposed to in the createBrowserRouter function
export async function loader() {
  return {
    events: loadEvents(),
  };
}
