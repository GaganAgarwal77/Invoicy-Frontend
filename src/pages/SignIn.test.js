import React from 'react';
import { shallow } from 'enzyme';
import SignIn from './SignIn';

describe('SignIn', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<SignIn/>);
  });
  it('renders the component', () => {
    expect(wrapper.find('.auth-wrapper')).toHaveLength(1);
  });

  it('updates the state when the username input changes', () => {
    const usernameInput = wrapper.find('input[type="text"]');
    usernameInput.simulate('change', { target: { value: 'testuser' } });
    expect(wrapper.state('username')).toEqual('testuser');
  });

  it('updates the state when the password input changes', () => {
    const passwordInput = wrapper.find('input[type="password"]');
    passwordInput.simulate('change', { target: { value: 'testpassword' } });
    expect(wrapper.state('password')).toEqual('testpassword');
  });

  it('calls the signinHandler function when the Sign in button is clicked', () => {
    const signinHandlerSpy = jest.spyOn(wrapper.instance(), 'signinHandler');
    const signinButton = wrapper.find('button');
    signinButton.simulate('click');
    expect(signinHandlerSpy).toHaveBeenCalled();
  });
});