import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Dunnkayce from "./pages/Dunnkayce";
import Grills from "./pages/Grills";
import BTO from "./pages/BTO";
import Laughters from "./pages/Laughters";
import Search from "./pages/Search";
import Profile from "./pages/profile/index";
import ChangePassword from "./pages/profile/ChangePassword";
import ChangeName from "./pages/profile/ChangeName";
import ChangeEmail from "./pages/profile/ChangeEmail";
import ChangeAddress from "./pages/profile/ChangeAddress";
import Reorder from "./pages/Reorder";
import TrackOrder from "./pages/TrackOrder";
import Checkout from "./pages/Checkout";
import LoginPage from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardPage from "./pages/dashboard/Dashboard";
import NotFoundPage from "./components/NotFoundPage";
import RunnerHome from "./pages/Runner";
import RunnerHistory from "./pages/RunnerHistory";
import RunnerOrders from "./pages/Orders";
import ActiveOrderDetails from "./pages/ActiveOrderDetails";
import AuthCallback from "./pages/AuthCallback";
import SSOCallbackPage from "./pages/SSOCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";


const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      // 1. GLOBAL PUBLIC ROUTES (Accessible even by logged-in runners)
      { path: "login", element: <LoginPage /> },
      { path: "sso-callback", element: <SSOCallbackPage /> },
      { path: "auth-callback", element: <AuthCallback /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      
      // 2. PUBLIC STUDENT BROWSING (Guests allowed, but runners blocked/redirected)
      {
        element: <ProtectedRoute allowedRoles={["student", "admin"]} allowGuests />,
        children: [
            { index: true, element: <Home /> },
            { path: "dunnkayce", element: <Dunnkayce /> },
            { path: "grills", element: <Grills /> },
            { path: "bto", element: <BTO /> },
            { path: "the-laughters-kitchen", element: <Laughters /> },
            { path: "search", element: <Search /> },
        ]
      },

      // 3. RUNNER ROUTES (Protected)
      {
        path: "runner",
        element: <ProtectedRoute allowedRoles={["runner", "admin"]} />,
        children: [
          { index: true, element: <RunnerHome /> },
          { path: "history", element: <RunnerHistory /> },
          {
            path: "orders",
            children: [
              { index: true, element: <RunnerOrders /> },
              { path: ":orderId", element: <ActiveOrderDetails /> },
            ]
          },
          {
            path: "profile",
            children: [
              { index: true, element: <Profile /> },
              { path: "change-address", element: <ChangeAddress /> },
              { path: "change-email", element: <ChangeEmail /> },
              { path: "change-username", element: <ChangeName /> },
              { path: "change-password", element: <ChangePassword /> },
            ],
          },
        ]
      },

      // 4. ADMIN ROUTES (Protected)
      {
        path: "dashboard",
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          { index: true, element: <DashboardPage /> }
        ]
      },

      // 5. STUDENT/CUSTOMER PROTECTED (Students + Admins, Guests redirected to login, Runners blocked)
      {
        element: <ProtectedRoute allowedRoles={["student", "admin"]} />,
        children: [
          { path: "reorder", element: <Reorder /> },
          { path: "track/:orderId", element: <TrackOrder /> },
          { path: "checkout", element: <Checkout /> },
          {
            path: "profile",
            children: [
              { index: true, element: <Profile /> },
              { path: "change-address", element: <ChangeAddress /> },
              { path: "change-email", element: <ChangeEmail /> },
              { path: "change-username", element: <ChangeName /> },
              { path: "change-password", element: <ChangePassword /> },
            ],
          },
        ]
      },
    ],
  },
]);


createRoot(document.getElementById("root")!).render(
  <StrictMode>
  <ClerkProvider publishableKey="pk_test_cHJlc2VudC1sYWNld2luZy05NC5jbGVyay5hY2NvdW50cy5kZXYk">
   <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
    <RouterProvider router={router} />
    </ConvexProviderWithClerk>
  </ClerkProvider>
  </StrictMode>
);
