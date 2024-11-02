"use client"; // Ensure this component is rendered on the client side
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  SelectChangeEvent,
  Snackbar,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";

export default function AirdropPage() {
  const [amount, setAmount] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const handleAmountChange = (event: SelectChangeEvent<string>) => {
    setAmount(event.target.value);
  };

  const handleWalletAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setWalletAddress(event.target.value);
  };

  const handleAirdrop = async () => {
    try {
      const response = await fetch(`/api/airdrop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress, amount }),
      });

      const data = await response.json();
      if (response.ok) {
        setSnackbarMessage(data.message);
      } else {
        setSnackbarMessage(data.error || "Airdrop failed. Please try again.");
      }
      setSnackbarOpen(true); // Open the snackbar to show the message
    } catch (error) {
      console.log("Error giving airdrop!", error);
      setSnackbarMessage("Airdrop failed due to an unexpected error.");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
      <div className="mb-8 text-xl">
        <Image
          src="/solana_image.svg"
          alt="Solana Faucet"
          width={200}
          height={50}
        />
      </div>
      <div className="border border-gray-600 rounded-lg p-8 bg-gray-800 text-center max-w-md w-full">
        <div className="font-semibold text-2xl text-white mb-2">
          Request Airdrop
        </div>
        <p className="text-slate-400 font-bold mb-6">
          Maximum number of two requests per hour
        </p>
        <div className="flex space-x-4 mb-6">
          <TextField
            variant="outlined"
            label="Wallet address"
            value={walletAddress}
            onChange={handleWalletAddressChange}
            InputProps={{
              style: { color: "#e0e0e0" },
            }}
            InputLabelProps={{
              style: { color: "#b0b0b0" },
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgb(129, 140, 160)",
                },
                "&:hover fieldset": {
                  borderColor: "rgb(156, 163, 175)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
            }}
          />

          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: "#b0b0b0" }}>Amount</InputLabel>
            <Select
              value={amount}
              onChange={handleAmountChange}
              label="Amount"
              sx={{
                color: "#e0e0e0",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgb(129, 140, 160)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgb(156, 163, 175)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white",
                },
                "& .MuiSvgIcon-root": {
                  color: "#b0b0b0",
                },
              }}
            >
              <MenuItem value="0.5">0.5</MenuItem>
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="1.5">1.5</MenuItem>
              <MenuItem value="2">2</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Button
          variant="contained"
          disabled={!walletAddress || !amount}
          onClick={handleAirdrop}
          sx={{
            backgroundColor: walletAddress && amount ? "#4fc3f7" : "#fbf7fa",
            color: "white",
            "&:hover": {
              backgroundColor: walletAddress && amount ? "#29b6f6" : "#fbf7fa",
            },
            "&.Mui-disabled": {
              backgroundColor: "#fbf7fa",
              color: "#888",
            },
          }}
        >
          Confirm Airdrop
        </Button>
        <Snackbar
          open={snackbarOpen}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          autoHideDuration={4000}
        />
      </div>
    </div>
  );
}
