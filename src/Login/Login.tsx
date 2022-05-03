import React, {useState} from "react";
import Web3 from 'web3';

import { Auth } from '../helpers/types';

interface Props {
	onLoggedIn: (auth: Auth) => void;
}
let web3: Web3 | undefined = undefined; // Will hold the web3 instance

export function Login({ onLoggedIn }: Props) {
	const [loading, setLoading] = useState(false); // Loading button state
    const handleAuthenticate = ({
                                    public_address,
                                    signature,
                                }: {
        public_address: string;
        signature: string;
    }) =>
        fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/w3/`, {
            body: JSON.stringify({ public_address, signature }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        }).then((response) => response.json());

    // @ts-ignore
	const handleSignMessage = async ({
		public_address,
		nonce,
	}: {
		public_address: string;
		nonce: string;
	}) => {
		try {
			const signature = await web3!.eth.personal.sign(
				`I am signing my one-time nonce: ${nonce}`,
				public_address,
				'' // MetaMask will ignore the password argument here
			);

			return { public_address, signature };
		} catch (err) {
			throw new Error(
				'You need to sign the message to be able to log in.'
			);
		}
	};

    const handleSignup = (publicAddress: string, chain: string) =>
		fetch(`${process.env.REACT_APP_BACKEND_URL}/users/`, {
			body: JSON.stringify({
				chain: chain,
				public_address: publicAddress
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		}).then((response) => response.json());

    const handleClick = async () => {
        if (!(window as any).ethereum) {
			window.alert('Please install MetaMask first.');
			return;
        }

        if (!web3) {
            try {
				// Request account access if needed

				// await (window as any).ethereum.enable();

				const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
				console.log(accounts);
				// We don't know window.web3 version, so we use our own instance of Web3
				// with the injected provider given by MetaMask
				web3 = new Web3((window as any).ethereum);
            } catch (error) {
				window.alert('You need to allow MetaMask.');
				return;
            }
        }

        const coinbase = await web3.eth.getCoinbase();
		if (!coinbase) {
			window.alert('Please activate MetaMask first.');
			return;
		}

        const publicAddress = coinbase.toLowerCase();
		setLoading(true);

		// Look if user with current publicAddress is already present on backend
		fetch(
			`${process.env.REACT_APP_BACKEND_URL}/users/${publicAddress}/`
		)
        .then((response) => response.json())
        // If yes, retrieve it. If no, create it.
        .then((users) =>
            users.length ? users[0] : handleSignup(publicAddress, 'Ethereum')
        )
        // Popup MetaMask confirmation modal to sign message
        .then(handleSignMessage)
        // Send signature to backend on the /auth route
        .then(handleAuthenticate)
        // Pass accessToken back to parent component (to save it in localStorage)
        .then(onLoggedIn)
        .catch((err) => {
            window.alert(err);
            setLoading(false);
        });
    };

    return (
		<div>
			<p>
				Please select your login method.
				<br />
				For the purpose of this demo, only MetaMask login is
				implemented.
			</p>
			<button className="Login-button Login-mm" onClick={handleClick}>
				{loading ? 'Loading...' : 'Login with MetaMask'}
			</button>
		</div>
    );
}
