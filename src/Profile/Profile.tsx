// import './Profile.css';

import jwtDecode from 'jwt-decode';
import React, { useState, useEffect } from 'react';
// @ts-ignore
import Blockies from 'react-blockies';

import { Auth } from '../helpers/types';

interface Props {
    auth: Auth;
    user?: {
        id: number;
        username: string;
        public_address: string;
    };
    onLoggedOut: () => void;
}

interface State {
    loading: boolean;
    user?: {
        id: number;
        username: string;
        public_address: string;
    };
    username: string;
}

interface JwtDecoded {
    payload: {
        id: string;
        public_address: string;
    };
}

export const Profile = ({ auth, onLoggedOut }: Props): JSX.Element => {
    const [state, setState] = useState<State>({
        loading: false,
        user: undefined,
        username: '',
    });

    console.log(auth);

    useEffect(() => {
        // @ts-ignore
        const { access, user } = auth;

        fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${user?.public_address}/`, {
            headers: {
                Authorization: `Bearer ${access}`,
            },
        })
            .then((response) => response.json())
            .then((user) => setState({ ...state, user }))
            .catch(window.alert);
    }, []);

    const handleChange = ({
                              target: { value },
                          }: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, username: value });
    };

    const handleSubmit = () => {
        const { access } = auth;
        const { user, username } = state;

        setState({ ...state, loading: true });

        if (!user) {
            window.alert(
                'The user id has not been fetched yet. Please try again in 5 seconds.'
            );
            return;
        }

        fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${user?.public_address}/`, {
            body: JSON.stringify({ username }),
            headers: {
                Authorization: `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
            method: 'PATCH',
        })
            .then((response) => response.json())
            .then((user) => setState({ ...state, loading: false, user }))
            .catch((err) => {
                window.alert(err);
                setState({ ...state, loading: false });
            });
    };

    const { access } = auth;
    const { loading, user } = state;

    const username = user && user.username;

    return (
        <div className="Profile">
            <p>
                Logged in as <Blockies seed={user?.public_address} />
            </p>
            <div>
                My username is {username ? <pre>{username}</pre> : 'not set.'}{' '}
                My publicAddress is <pre>{user?.public_address}</pre>
            </div>
            <div>
                <label htmlFor="username">Change username: </label>
                <input name="username" onChange={handleChange} />
                <button disabled={loading} onClick={handleSubmit}>
                    Submit
                </button>
            </div>
            <p>
                <button onClick={onLoggedOut}>Logout</button>
            </p>
        </div>
    );
};
