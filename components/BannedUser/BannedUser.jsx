/**
 * BannedUser displays the account has been banned.
 *
 * @component
 * return (
 *   <BannedUser /> * )
 */
export default function BannedUser() {
  return (
    <div className="banned-container">
      <div className="banned-card">
        <div className="banned-icon">⚠️</div>
        <h1 className="banned-title">Access Denied</h1>
        <p className="banned-message">
          Your account has been suspended from accessing this platform.
        </p>
        
        <div className="banned-details">
          <h2 className="banned-details-title">What does this mean?</h2>
          <p className="banned-details-text">
            Your account has been banned due to a violation of our community guidelines 
            or terms of service. During this period, you will not be able to:
          </p>
          <ul className="banned-details-text">
            <li>Access your account</li>
            <li>Create or view posts</li>
            <li>Interact with other users</li>
            <li>Participate in community discussions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}