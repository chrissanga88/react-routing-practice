import { redirect, useRouteLoaderData, Await } from "react-router-dom";
import EventItem from "../components/EventItem";
import EventsList from "../components/EventsList";
import { Suspense } from "react";

export default function EventDetailPage() {
  // works almost like useLoaderData, but takes a route id as an argument that specifies which loader should be used
  const {event, events} = useRouteLoaderData('event-detail');

  // every await block should be wrapped with suspense otherwise suspense will await for both awaits to complete before showing anything
  return (
    <>
      <Suspense fallback={<p style={{ textAlign: 'center'}}>Loading...</p>}>
        <Await resolve={event}>
          {(loadedEvent) => <EventItem event={loadedEvent} />}
        </Await>
      </Suspense>
      <Suspense fallback={<p style={{ textAlign: 'center'}}>Loading...</p>}>
        <Await resolve={events}>
          {loadedEvents => <EventsList events={loadedEvents} />}
        </Await>
      </Suspense>
    </>
  );
}

async function loadEvent(id) {
  const response = await fetch('http://localhost:8080/events/' + id);
  
  if (!response.ok) {
    throw new Response(JSON.stringify({message: 'Could not fetch details for selected event.'}), {status: 500,});
  }
  else {
      // this has to be manually parsed instead of returning a response because of the deferred step in between the loader and useLoaderData
      const resData = await response.json();
      return resData.event;
  }
}

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

// react router, which calls the loader function passes an object to the loader function when it's executed. The object contains a request property, which contains a request object, and a params property, which contains an object with all the route parameters. The request object can be used to access the URL to access things like query parameters. The params object allows us to access the eventId route parameter
export async function loader({request, params}) {
  const id = params.eventId;
  
  return {
    // if you have an async loader with the async function you can add the await keyword and that will make sure react-router waits for this data to be loaded before loading this page component, but it will load the loadEvents data after the page is loaded. this allows you to decide which data should be awaited before loading the page and which data should be deferred 
    event: await loadEvent(id),
    events: loadEvents(),
  };
}

export async function action({ params, request }) {
  const eventId = params.eventId;
  const response = await fetch('http://localhost:8080/events/' + eventId, {
    method: request.method,
  });

  if (!response.ok) {
    throw new Response(JSON.stringify({message: 'Could not delete event.'}), {status: 500,});
  }

  return redirect('/events');
}