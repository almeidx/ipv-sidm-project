import { useState } from "react";
import Login from "../components/login";
import SignUp from "../components/sign-up";

export default function ExpoSignIn() {
	const [page, setPage] = useState<"login" | "sign-up">("login");

	if (page === "sign-up") {
		return <SignUp goToLogin={() => setPage("login")} />;
	}

	return <Login goToSignUp={() => setPage("sign-up")} />;
}
