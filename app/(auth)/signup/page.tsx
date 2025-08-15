import SignupForm from './SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div>
      <SignupForm />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
