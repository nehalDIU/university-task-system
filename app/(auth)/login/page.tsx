import LoginForm from './LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Sign In
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Welcome back! Please sign in to your account.
        </p>
      </div>
      
      <LoginForm />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign up
          </Link>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <Link href="/reset-password" className="text-blue-600 hover:text-blue-500">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  )
}



