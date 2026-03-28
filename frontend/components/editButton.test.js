import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import EditButton from "./EditButton";

beforeEach(() => {
  // Clear mocks and localStorage before each test
  localStorage.clear();
  jest.clearAllMocks();
});

const mockProject = {
  pname: "Demo Project",
  cname: "Test Client",
  start_date: "01-01-2024",
  end_date: "31-12-2024",
  Amount: 100000,
  Comments: "Initial setup phase",
};

// Mock fetch for POST request
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Project updated successfully!" }),
  })
);

test("renders the Edit button", () => {
  render(<EditButton project={mockProject} />);
  expect(screen.getByText(/edit project/i)).toBeInTheDocument();
});

test("shows alert for non-admin users when Edit is clicked", () => {
  localStorage.setItem("userRole", "user");
  render(<EditButton project={mockProject} />);
  
  window.alert = jest.fn(); // mock alert
  fireEvent.click(screen.getByText(/edit project/i));
  expect(window.alert).toHaveBeenCalledWith("Editing is only allowed for admin users.");
});

test("opens modal for admin users and updates fields", async () => {
  localStorage.setItem("userRole", "admin");
  localStorage.setItem("userEmail", "admin@example.com");

  render(<EditButton project={mockProject} />);

  fireEvent.click(screen.getByText(/edit project/i));

  await waitFor(() => {
    expect(screen.getByText(/edit project details/i)).toBeInTheDocument();
  });

  // Change project name
  fireEvent.change(screen.getByPlaceholderText(/enter project name/i), {
    target: { value: "Updated Project Name" },
  });

  // Click Save
  fireEvent.click(screen.getByText(/save/i));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith("/api/updateProject", expect.any(Object));
    expect(screen.queryByText(/edit project details/i)).not.toBeInTheDocument(); // modal closed
  });
});
