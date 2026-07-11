import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", minWidth: 0, overflowX: "hidden" }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 }, minWidth: 0 }}>
        {children}
      </Container>
    </Box>
  );
}
