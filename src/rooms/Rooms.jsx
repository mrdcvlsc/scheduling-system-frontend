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
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

import "../assets/main.css";
import { fetchAllDepartments, fetchDepartmentRooms } from "../js/schedule"

function Rooms() {
    const [room, setRoom] = useState("")
    const [roomList, setRoomList] = useState([])

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const handleChangePage = async (event, new_page) => {
        console.log('handleChangePage :', new_page)
        setPage(new_page);
        await load_rooms(departmentID, new_page)
    };

    const handleChangeRowsPerPage = async (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
        await load_rooms(departmentID, 0)
    };

    const [departmentList, setDepartmentList] = useState("")
    useEffect(() => {
        const useEffectAsyncs = async () => {
            try {
                setLoading(true);

                const all_departments = await fetchAllDepartments();

                setDepartmentList(all_departments);
                console.log('all_departments')
                console.log(all_departments);

                setLoading(false);
            } catch (err) {
                setPopupOptions({
                    Heading: "Failed to Fetch All Department Data",
                    HeadingStyle: { background: "red", color: "white" },
                    Message: `${err}`
                });
                setLoading(false);
                setSemesterIndex("");
            }
        };

        useEffectAsyncs();
    }, []);

    const load_rooms = async(department_id, new_page) => {
        console.log('loading rooms for department id :', department_id)
        console.log('pageSize :', pageSize)
        console.log('page :', new_page)

        setLoading(true);

        try {
            const rooms = await fetchDepartmentRooms(department_id, pageSize, new_page)
            console.log(`fetched rooms : ${rooms}`)

            setRoomList(rooms.Rooms)
            setTotalCount(rooms.TotalRooms)
        } catch (err) {
            SetPopUpOptions({
                Heading: "Failed to fetch rooms",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            })
        }

        setLoading(false);
    }

    const [departmentID, setDepartmentID] = useState("")
    const [department, setDepartment] = useState("")
    const handleDepartmentChange = async (e) => {

        const department_id = e.target.value

        console.log(`selected departmentID: ${department_id}`)
        setDepartmentID(department_id)

        let selected_department = null
        for (let i = 0; i < departmentList?.length; i++) {
            if (departmentList[i].DepartmentID === department_id) {
                setDepartment(departmentList[i])
                selected_department = departmentList[i]
                break
            }
        }

        await load_rooms(department_id, page)
    }

    return (<>
        <Box>
            <Box>
                <FormControl sx={{ minWidth: 130 }} size="small">
                    <InputLabel id="label-id-department">Department</InputLabel>
                    <Select
                        id="id-department" labelId="label-id-department" label="Department"
                        value={departmentID}
                        onChange={handleDepartmentChange}
                    >
                        <MenuItem value=""><em>none</em></MenuItem>
                        {departmentList ?
                            departmentList.map((department_iter, index) => (
                                <MenuItem key={index} value={department_iter.DepartmentID}>{`${department_iter.Code} - ${department_iter.Name}`}</MenuItem>
                            )) : null
                        }
                    </Select>
                </FormControl>
                {/* > new room will be a form dialog */}
            </Box>
            <Box
                padding={'1em'}
                display={'flex'}
                justifyContent={'space-between'}
            >
                <Typography>Rooms</Typography>
                <Typography>{department ? `${department?.Name}` : null}</Typography>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ height: 1 }}>

                            <TableCell>Room ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Capacity</TableCell>
                            <TableCell>Room Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
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
