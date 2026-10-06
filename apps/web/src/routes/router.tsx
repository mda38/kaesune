import { createBrowserRouter } from "react-router-dom";
import { RequireSession } from "./RequireSession";
import { AllocationPage } from "../pages/allocation/AllocationPage";
import { GroupPage } from "../pages/group/GroupPage";
import { HomePage } from "../pages/home/HomePage";
import { InvoiceDetailPage } from "../pages/invoices/InvoiceDetailPage";
import { InvoicesPage } from "../pages/invoices/InvoicesPage";
import { LoginPage } from "../pages/login/LoginPage";
import { MypagePage } from "../pages/mypage/MypagePage";
import { RecordsPage } from "../pages/records/RecordsPage";
import { RecordDetailPage } from "../pages/records/RecordDetailPage";
import { WalletsPage } from "../pages/wallets/WalletsPage";

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  {
    element: <RequireSession />,
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/records", element: <RecordsPage /> },
      { path: "/records/:withdrawalId", element: <RecordDetailPage /> },
      {
        path: "/records/:withdrawalId/claims/new",
        element: <AllocationPage />,
      },
      { path: "/invoices", element: <InvoicesPage /> },
      { path: "/invoices/:claimId", element: <InvoiceDetailPage /> },
      { path: "/mypage", element: <MypagePage /> },
      { path: "/wallets", element: <WalletsPage /> },
      { path: "/group", element: <GroupPage /> },
    ],
  },
]);
