import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | TodoMaster",
  description: "Login to your todo application account",
};

export default function LoginPage() {
  return <LoginForm />;
}