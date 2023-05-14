import React from 'react';
import { shallow } from 'enzyme';
import SignUp from './SignUp';

describe('SignUp', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<SignUp/>);
  });
  it('renders the component', () => {
    expect(wrapper.find('.auth-wrapper')).toHaveLength(1);
  });

  it('updates the state when the name input changes', () => {
    const nameInput = wrapper.find('input[type="text"]').at(0);
    nameInput.simulate('change', { target: { value: 'test user' } });
    expect(wrapper.state('name')).toEqual('test user');
  });

  it('updates the state when the username input changes', () => {
    const usernameInput = wrapper.find('input[type="text"]').at(1);
    usernameInput.simulate('change', { target: { value: 'testuser' } });
    expect(wrapper.state('username')).toEqual('testuser');
  });

  it('should update the state when the email input changes', () => {
    const emailInput = wrapper.find('input[type="email"]');
    emailInput.simulate('change', { target: { value: 'test@test.com' } });
    expect(wrapper.state('email')).toEqual('test@test.com');
  });

  it('updates the state when the password input changes', () => {
    const passwordInput = wrapper.find('input[type="password"]');
    passwordInput.simulate('change', { target: { value: 'testpassword' } });
    expect(wrapper.state('password')).toEqual('testpassword');
  });

  it('calls the signupHandler function when the Sign up button is clicked', () => {
    const signupHandlerSpy = jest.spyOn(wrapper.instance(), 'signupHandler');
    const signUpButton = wrapper.find('button');
    signUpButton.simulate('click');
    expect(signupHandlerSpy).toHaveBeenCalled();
  });
});