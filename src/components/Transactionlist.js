import React, { Component } from "react";
import { SERVER_URL } from "../constants.js";
import ReactTable from "react-table-6";
import "react-table-6/react-table.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddTransaction from "./AddTransaction";
import EditTransaction from "./EditTransaction";
import { CSVLink } from "react-csv";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

class Transactionlist extends Component {
  constructor(props) {
    super(props);
    this.state = { transactions: [] };
  }

  componentDidMount() {
    this.fetchTransactions();
  }

  fetchTransactions = () => {
    console.log("FETCH");
    // Read the token from the session storage
    // and include it to Authorization header
    const token = sessionStorage.getItem("jwt");
    fetch(SERVER_URL + "api/transactions", {
      headers: { Authorization: token },
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          transactions: responseData._embedded.transactions,
        });
      })
      .catch((err) => console.error(err));
  };

  // Delete transaction
  onDelClick = (link) => {
    if (window.confirm("Are you sure to delete?")) {
      const token = sessionStorage.getItem("jwt");
      fetch(link, { method: "DELETE", headers: { Authorization: token } })
        .then((res) => {
          toast.success("Transaction deleted", {
            position: toast.POSITION.BOTTOM_LEFT,
          });
          this.fetchTransactions();
        })
        .catch((err) => {
          toast.error("Error when deleting", {
            position: toast.POSITION.BOTTOM_LEFT,
          });
          console.error(err);
        });
    }
  };

  // Add new transaction
  addTransaction(transaction) {
    const token = sessionStorage.getItem("jwt");
    fetch(SERVER_URL + "api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(transaction),
    })
      .then((res) => this.fetchTransactions())
      .catch((err) => console.error(err));
  }

  // Update transaction
  updateTransaction(transaction, link) {
    const token = sessionStorage.getItem("jwt");
    fetch(link, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(transaction),
    })
      .then((res) => {
        toast.success("Changes saved", {
          position: toast.POSITION.BOTTOM_LEFT,
        });
        this.fetchTransactions();
      })
      .catch((err) =>
        toast.error("Error when saving", {
          position: toast.POSITION.BOTTOM_LEFT,
        })
      );
  }

  render() {
    const columns = [
      {
        Header: "Transaction name",
        accessor: "transactionName",
      },
      {
        Header: "Proportion",
        accessor: "proportion",
      },
      {
        Header: "Month",
        accessor: "month",
      },
      {
        Header: "amount(CAD)",
        accessor: "cost",
      },
      {
        sortable: false,
        filterable: false,
        width: 100,
        accessor: "_links.self.href",
        Cell: ({ value, row }) => (
          <EditTransaction
            transaction={row}
            link={value}
            updateTransaction={this.updateTransaction}
            fetchTransactions={this.fetchTransactions}
          />
        ),
      },
      {
        sortable: false,
        filterable: false,
        width: 100,
        accessor: "_links.self.href",
        Cell: ({ value }) => (
          <Button
            color="primary"
            size="small"
            onClick={() => {
              this.onDelClick(value);
            }}
          >
            Delete
          </Button>
        ),
      },
    ];

    return (
      <div className="App">
        <Grid container>
          <Grid item>
            <AddTransaction
              addTransaction={this.addTransaction}
              fetchTransactions={this.fetchTransactions}
            />
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              style={{ margin: 10 }}
              onClick={() => {
                this.fetchTransactions();
              }}
            >
              Refresh
            </Button>
          </Grid>
          <Grid item style={{ padding: 15 }}>
            <CSVLink data={this.state.transactions} separator=";">
              Export CSV
            </CSVLink>
          </Grid>
        </Grid>
        <ReactTable
          data={this.state.transactions}
          columns={columns}
          filterable={true}
          defaultPageSize={10}
        />
        <ToastContainer autoClose={1500} />
      </div>
    );
  }
}

export default Transactionlist;
