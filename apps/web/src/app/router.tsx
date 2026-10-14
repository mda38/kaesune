import { createBrowserRouter } from "react-router-dom";
import { RequireSession } from "@/app/routes/app/root";
import { AllocationPage } from "@/app/routes/app/records/allocation";
import { GroupPage } from "@/app/routes/app/group";
import { HomePage } from "@/app/routes/app/home";
import { InvoiceDetailPage } from "@/app/routes/app/invoices/invoice-detail";
import { InvoicesPage } from "@/app/routes/app/invoices/invoices";
import { LoginPage } from "@/app/routes/login";
import { MypagePage } from "@/app/routes/app/mypage";
import { RecordsPage } from "@/app/routes/app/records/records";
import { RecordDetailPage } from "@/app/routes/app/records/record-detail";
import { WalletsPage } from "@/app/routes/app/wallets";

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
