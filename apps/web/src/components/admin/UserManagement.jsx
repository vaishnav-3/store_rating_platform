import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDate, getRoleColor } from "../../utils/helpers";
import { USER_ROLES } from "../../utils/constants";
import LoadingSpinner from "../common/LoadingSpinner";
import Pagination from "../common/Pagination";
import adminService from "../../services/adminService";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ email: "", address: "", role: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      // Check if any filter has a value
      const hasFilters = Object.values(filters).some((val) => val.trim() !== "");

      // Build query string
      const queryParams = {
        page: currentPage,
        limit: usersPerPage,
        ...(hasFilters ? filters : {}), // add filters only if present
      };

      // Call /admin/users with optional filters
      const usersData = await adminService.getALLUsers(queryParams);

      console.log(usersData);
      // Update state
      setUsers(usersData || []);
      setTotalUsers(usersData.length || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ email: "", address: "", role: "" });
    setCurrentPage(1);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminService.deleteUser(userId);
      fetchUsers(); // refresh list
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.changeUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, role: newRole, updatedAt: new Date().toISOString() }
            : user
        )
      );
    } catch (err) {
      alert("Failed to update role.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Link to="/admin/create-user" className="btn-primary">
          + Create New User
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            className="input-field"
            placeholder="Filter by email..."
          />
          <input
            type="text"
            name="address"
            value={filters.address}
            onChange={handleFilterChange}
            className="input-field"
            placeholder="Filter by address..."
          />
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All roles</option>
            <option value={USER_ROLES.ADMIN}>Administrator</option>
            <option value={USER_ROLES.USER}>User</option>
            <option value={USER_ROLES.STORE_OWNER}>Store Owner</option>
          </select>
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Users ({totalUsers})
        </h2>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Loading users..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(
                          user.role
                        )}`}
                      >
                        <option value={USER_ROLES.ADMIN}>Admin</option>
                        <option value={USER_ROLES.USER}>User</option>
                        <option value={USER_ROLES.STORE_OWNER}>
                          Store Owner
                        </option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {user.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {user.role === USER_ROLES.USER && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalUsers > usersPerPage && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalUsers}
            itemsPerPage={usersPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;