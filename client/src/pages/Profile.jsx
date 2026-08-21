import { useUser } from "@clerk/react";

function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Not signed in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.firstName || "User"}</h1>

      <p>User ID: {user.id}</p>

      <p>
        Email: {user.primaryEmailAddress?.emailAddress}
      </p>
    </div>
  );
}

export default Profile;