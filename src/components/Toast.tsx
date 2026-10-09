import { useEffect, useState } from "react";

type ToastFn = (message: string) => void;
let notify: ToastFn = () => {};

export function toast(message: string) {
  notify(message);
}

export function ToastHost() {
  const [message, setMessage] = useState("Fatto.");
  const [show, setShow] = useState(false);

  useEffect(() => {
    notify = (next) => {
      setMessage(next);
      setShow(true);
      window.setTimeout(() => setShow(false), 2200);
    };
    return () => {
      notify = () => {};
    };
  }, []);

  return (
    <div className={`toast${show ? " show" : ""}`} role="status">
      {message}
    </div>
  );
}
