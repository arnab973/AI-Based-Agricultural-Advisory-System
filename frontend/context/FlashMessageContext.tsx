"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

type FlashMessageType = "success" | "error" | "warning" | "info";

interface FlashMessageContextType {
  showMessage: (
    message: string,
    type?: FlashMessageType,
    duration?: number
  ) => void;
}

const FlashMessageContext = createContext<
  FlashMessageContextType | undefined
>(undefined);

export function FlashMessageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] =
    useState<FlashMessageType>("info");

  const showMessage = useCallback(
    (
      newMessage: string,
      type: FlashMessageType = "info",
      duration: number = 3000
    ) => {
      setMessage(newMessage);
      setMessageType(type);

      setTimeout(() => {
        setMessage("");
      }, duration);
    },
    []
  );

  // Check for flash message saved before redirect
  useEffect(() => {
    const savedMessage =
      sessionStorage.getItem("flash_message");

    if (!savedMessage) {
      return;
    }

    try {
      const parsedMessage = JSON.parse(savedMessage);

      if (parsedMessage?.message) {
        showMessage(
          parsedMessage.message,
          parsedMessage.type || "info",
          3000
        );
      }
    } catch (error) {
      console.error(
        "Flash message error:",
        error
      );
    }

    sessionStorage.removeItem("flash_message");
  }, [showMessage]);

  return (
    <FlashMessageContext.Provider
      value={{
        showMessage,
      }}
    >
      {children}

      {message !== "" && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 99999,

            minWidth: "280px",
            maxWidth: "400px",

            padding: "14px 18px",

            borderRadius: "12px",

            color: "#ffffff",

            fontSize: "14px",
            fontWeight: "600",

            boxShadow:
              "0 10px 30px rgba(0, 0, 0, 0.25)",

            backgroundColor:
              messageType === "success"
                ? "#16a34a"
                : messageType === "error"
                ? "#dc2626"
                : messageType === "warning"
                ? "#ca8a04"
                : "#2563eb",
          }}
        >
          {message}
        </div>
      )}
    </FlashMessageContext.Provider>
  );
}

export function useFlashMessage() {
  const context =
    useContext(FlashMessageContext);

  if (context === undefined) {
    throw new Error(
      "useFlashMessage must be used inside FlashMessageProvider"
    );
  }

  return context;
}