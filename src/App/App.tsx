import './App.css';

import React, {useEffect, useState} from 'react';
// @ts-ignore
import logo from '../logo.svg';
import {Auth} from "../helpers/types";
import { Profile } from '../Profile';
import { Login } from '../Login';

const LS_KEY = 'login-with-metamask:auth';

interface State {
	auth?: Auth;
}

function App() {
  const [state, setState] = useState<State>({});

	useEffect(() => {
		// Access token is stored in localstorage
		const ls = window.localStorage.getItem(LS_KEY);
		const auth = ls && JSON.parse(ls);
		setState({ auth });
	}, []);

	const handleLoggedIn = (auth: Auth) => {
		localStorage.setItem(LS_KEY, JSON.stringify(auth));
		setState({ auth });
	};

	const handleLoggedOut = () => {
		localStorage.removeItem(LS_KEY);
		setState({ auth: undefined });
	};


  const { auth } = state;

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
      <div>
		{auth ? (
			<Profile auth={auth} onLoggedOut={handleLoggedOut} />
		) : (
			<Login onLoggedIn={handleLoggedIn} />
		)}
      </div>
    </div>
  );
}

export default App;
