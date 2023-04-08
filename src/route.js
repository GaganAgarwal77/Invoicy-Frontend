import React from 'react';

const SignUp = React.lazy(() => import('./pages/SignUp'));
const SignIn = React.lazy(() => import('./pages/SignIn'));
const Landing = React.lazy(() => import('./pages/Landing'));

const route = [
    { path: '/signup', exact: true, name: 'Signup', component: SignUp },
    { path: '/signin', exact: true, name: 'Signin', component: SignIn },
    { path: '/', exact: true, name: 'Landing', component: Landing },
];

export default route;