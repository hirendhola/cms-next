import React from "react";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-6 bg-white shadow-md rounded-xl">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-700">
          You are not authorized to view this page.
          <br />
          Please don’t try anything sneaky 😊
        </p>
      </div>
    </div>
  );
}
