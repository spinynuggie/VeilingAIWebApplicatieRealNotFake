import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div>
      <h1>Landing Page</h1>
      <nav>
        <Link to="/Login">Login</Link>
        {" | "}
        <Link to="/Register">Register</Link>
      </nav>
    </div>
  );
}
