/**
 * Authentication Test Guide
 *
 * This component provides a guide for manually testing the authentication flow.
 * It's not meant to be used in the actual app but as documentation for testing.
 */

export const AuthTestGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Authentication System Test Guide</h2>

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">T047 - Complete Registration Flow</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Navigate to /register</li>
            <li>Fill registration form with valid data (name, email, password, confirm password)</li>
            <li>Submit form</li>
            <li>Verify account created in backend</li>
            <li>Verify auto-login works</li>
            <li>Verify redirect to /dashboard</li>
            <li>Verify token stored in cookies</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">T048 - Complete Login Flow</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Navigate to /login</li>
            <li>Fill login form with valid credentials</li>
            <li>Submit form</li>
            <li>Verify authentication succeeds</li>
            <li>Verify token stored in cookies</li>
            <li>Verify redirect to /dashboard</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">T049 - Form Validation</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Test email format validation (e.g., "invalid-email" should fail)</li>
            <li>Test password length validation (min 8 chars)</li>
            <li>Test password match in registration</li>
            <li>Test required field validation</li>
            <li>Test error messages display correctly</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">T050 - Error Handling</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Test duplicate email registration</li>
            <li>Test invalid login credentials</li>
            <li>Test network error handling</li>
            <li>Test backend error messages display</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">T051 - Route Protection</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Access /dashboard without authentication → should redirect to /login</li>
            <li>Access /tasks without authentication → should redirect to /login</li>
            <li>Access /login with authentication → should redirect to /dashboard</li>
            <li>Verify middleware saves intended destination</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">T052 - Session Persistence</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Login successfully</li>
            <li>Close browser completely</li>
            <li>Reopen browser and visit app</li>
            <li>Verify still authenticated</li>
            <li>Verify no need to login again</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">T053 - Logout Functionality</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Login successfully</li>
            <li>Trigger logout from dashboard</li>
            <li>Verify token removed from cookies</li>
            <li>Verify redirected to /login</li>
            <li>Verify cannot access protected routes</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">T054 - JWT Token Security</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Check token has proper expiration (24h)</li>
            <li>Verify cookie has sameSite=lax</li>
            <li>Verify cookie has secure flag in production</li>
            <li>Verify token sent with all API requests</li>
          </ol>
        </section>
      </div>
    </div>
  );
};