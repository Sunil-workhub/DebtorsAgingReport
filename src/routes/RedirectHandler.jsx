// src/components/RedirectHandler.jsx
import {
  Box,
  CircularProgress,
  Typography,
  Stack,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import IndefLogo from "../assets/logo/IndefLogo.png";

const RedirectHandler = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        textAlign: "center",
        padding: 4,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Animated Logo */}
          <motion.img
            src={IndefLogo}
            alt="Indef Logo"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              width: "80px",
              height: "auto",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              backgroundColor: "#fff", // Optional: to make transparent logos visible
              padding: "4px", // Optional: some spacing
            }}
          />

          <CircularProgress color="inherit" thickness={4} />

          <Typography variant="h5" fontWeight={500}>
            Redirecting...
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Please wait while we verify your credentials.
          </Typography>
        </Stack>
      </motion.div>
    </Box>
  );
};

export default RedirectHandler;
