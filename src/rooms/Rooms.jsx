import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import {
    Box,
    FormControl, InputLabel,
    TextField, Select, MenuItem,
    Button,
    Typography,

    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    Paper, CircularProgress,

    Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions,

    createTheme,
} from "@mui/material";

import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import "../assets/main.css";
import { fetchAllDepartments, fetchDepartmentRooms } from "../js/schedule"

function Rooms() {
    const [department, setDepartment] = useState("")
    const [departmentList, setDepartmentList] = useState("")
    const handleDepartmentChange = async () => {

    }

    const [room, setRoom] = useState("")
    const [roomList, setRoomList] = useState([])

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    
    const handleChangePage = (event, new_page) => {
        setPage(new_page);
        setIsView(false)
    };

    const handleChangeRowsPerPage = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page
    };

    return (<>
        <Box>
            <Box>
                {/* > department dropdown left - new room button right */}
                {/* > new room will be a form dialog */}
            </Box>
            <Box
                padding={'1em'}
                display={'flex'}
                justifyContent={'space-between'}
            >
                <Typography>Rooms</Typography>
                <Typography>[Department]</Typography>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableCell>Room ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Capacity</TableCell>
                        <TableCell>Room Type</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableHead>
                    <TableBody>{loading ? (
                        <TableRow>
                            <TableCell align="center">
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : (roomList?.map((room, index) => (
                        <TableRow key={room.RoomID} sx={{ border: '1px solid yellow' }}>
                            <TableCell>{room.RoomID}</TableCell>
                            <TableCell>{room.Name}</TableCell>
                            <TableCell>{room.Capacity}</TableCell>
                            <TableCell>{room.RoomType}</TableCell>
                            <TableCell align="right">
                                <Button
                                    variant="contained" color="primary" size="small"
                                    style={{ marginRight: 8 }}
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => {
                                        // handleInstructorSelection(index)
                                        // setIsView(true)
                                        // setMode("view")
                                    }}
                                >
                                    View
                                </Button>
                                <Button
                                    variant="contained" color="error" size="small" endIcon={<DeleteIcon />}
                                    onClick={() => {
                                        // setInstructorToDelete(instructor)
                                        // setIsDialogDeleteShow(true)
                                    }}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    )))}</TableBody>
                </Table>

                <TablePagination
                    rowsPerPageOptions={[1, 5, 10, 15]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={pageSize}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </Box>
    </>)
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Rooms />
    </StrictMode>
);
