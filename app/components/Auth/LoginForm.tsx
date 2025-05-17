import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLoginMutation } from '~/api/authApi';
import { useNavigate, useLocation } from 'react-router';
import Spinner from '~/components/Core/Spinner';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginForm: React.FC = () => {
  const [login, { isLoading, error: apiError }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";


  const formik = useFormik({
    initialValues: {
      username: 'emilys',        // DummyJSON test user
      password: 'emilyspass',    // DummyJSON test user password
    },
    validationSchema: LoginSchema,
    onSubmit: async (values: { username: string; password: string; }) => {
      try {
        await login(values).unwrap(); // unwrap to handle error here or let onQueryStarted handle success
        navigate(from, { replace: true });
      } catch (err) {
        // err is already populated in apiError from the hook
        console.error('Login failed:', err);
        // No need to formik.setErrors here unless you want to map specific API errors to fields
      }
    },
  });

  const errorMessage = apiError && 'data' in apiError ?
                        (apiError.data as any)?.message || 'Invalid credentials or server error.' :
                        apiError && 'status' in apiError ? `Error: ${apiError.status}` : null;


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Sign in
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${formik.touched.username && formik.errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="Username (e.g., kminchelle)"
                {...formik.getFieldProps('username')}
              />
              {formik.touched.username && formik.errors.username ? (
                <p className="text-red-500 text-xs mt-1 px-1">{formik.errors.username}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="Password"
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password ? (
                <p className="text-red-500 text-xs mt-1 px-1">{formik.errors.password}</p>
              ) : null}
            </div>
          </div>

          {errorMessage && (
             <p className="text-red-500 text-sm text-center py-2">{errorMessage}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner size="sm" /> : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;