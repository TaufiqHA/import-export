"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../../globals.css";
import SwitchToggle from "../../../component/SwitchButton";
import Swal from "sweetalert2";

export default function Page() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.ok) {
          setIsAdmin(data.user.isAdmin);
        } else {
          console.error("response tidak ok");
        }
      } catch (error) {
        console.error(error);
        hk;
      }
    };

    fetchUser();

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        console.log(data);
        if (res.ok) {
          setUsers(data.user);
        } else {
          console.error("response tidak ok");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));

    fetchUsers();
  }, []);

  // useEffect(() => {
  //    console.log(users)
  // }, [users]);

  const deactive = async (id) => {
    try {
      const res = await fetch(`/api/users/deactive`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id.toString(), csrfToken }),
      });
      const body = await res.json();
      if (res.ok) {
        Swal.fire("Berhasil", "User telah di nonaktifkan", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error("response tidak ok");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const activate = async (id) => {
    try {
      const res = await fetch(`/api/users/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, csrfToken }),
      });
      if (res.ok) {
        Swal.fire("Berhasil", "User telah di aktifkan", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error("response tidak ok");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (!isAdmin && !loading) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
        <p>Halaman ini hanya dapat diakses oleh admin.</p>
      </div>
    );
  }

  return (
    <div className="dashboard min-h-screen bg-gray-100 py-10 px-4">
        <Link className="bg-blue-500 rounded-md p-2 text-white" href={"/signup"}>Tambah User</Link>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Daftar Users</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center"
            >
              <div className="w-20 h-20 mb-4 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500 mb-2">{user.email}</p>
              <p className="text-sm text-indigo-600 mb-2">
                {new Date(user.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <span className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {user.isAdmin ? <b>Admin</b> : "User"}
              </span>
              {!user.isAdmin && (
                <div className="flex items-center mt-2">
                  <span
                    className={`${
                      user.isActive ? "bg-green-800" : "bg-red-800"
                    } px-3 py-1 rounded-full text-sm text-white mr-2`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  <SwitchToggle
                    isOn={user.isActive ? true : false}
                    onTurnOff={() => {
                      deactive(user._id);
                    }}
                    onTurnOn={() => {
                      activate(user._id);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
