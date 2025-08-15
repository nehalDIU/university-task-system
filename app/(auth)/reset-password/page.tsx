import ResetPasswordForm from './ResetPasswordForm'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Reset Password
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <ResetPasswordForm />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}



