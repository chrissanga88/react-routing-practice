import { useFetcher } from 'react-router-dom';

import classes from './NewsletterSignup.module.css';
import { useEffect } from 'react';

function NewsletterSignup() {
  // if the fetcher.Form is used this will trigger an action (or loader) but it will not initialize a route transition, so it will not navigate to the page to which the loader or action belongs.
  const fetcher = useFetcher();
  // The data property is returned by the action or loader that is being triggered. The state property can be equal to idle, loading, or submitting that can tell you whether the fetcher behind the scenes completed its loader or actoin that was triggered
  const { data, state } = fetcher;

  useEffect(() => {
    if (state === 'idle' && data && data.message) {
      window.alert(data.message);
    }
  }, [data, state]);
  
  return (
    <fetcher.Form 
      method="post" 
      action="/newsletter"
      className={classes.newsletter}
    >
      <input
        type="email"
        placeholder="Sign up for newsletter..."
        aria-label="Sign up for newsletter"
      />
      <button>Sign up</button>
    </fetcher.Form>
  );
}

export default NewsletterSignup;
