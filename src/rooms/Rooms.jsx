import { StrictMode, useState, useEffect, useReducer } from "react";
import { createRoot } from "react-dom/client";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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
    Alert,
    ThemeProvider,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Chip,
} from "@mui/material";

import { Popup } from "../components/Loading";

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

import { fetchAllDepartments } from "../js/departments"
import { fetchDepartmentRooms, deleteRemoveRoom, patchUpdateRoom, postCreateRoom } from "../js/rooms"
import { MainHeader } from "../components/Header";
import theme from "../components/Theme";

function RoomTypeName(room_type) {
    switch (room_type) {
        case 0: return 'Lecture'
        case 1: return 'Laboratory'
        case 2: return 'Gym'
    }
}

function Rooms() {

    const ROOM_TYPES = [
        0, // lecture 
        1, // laboratory
        2, // gym
    ];

    const [mode, setMode] = useState("")
    const [isDialogFormOpen, setIsDialogFormOpen] = useState(false)

    const [popupOptions, setPopupOptions] = useState(null);
    const [isDialogDeleteShow, setIsDialogDeleteShow] = useState(false)
    const [roomToDelete, setRoomToDelete] = useState(null)
    const handleRoomDelete = async (room_id) => {
        setLoading(true);

        try {
            await deleteRemoveRoom(room_id);
            await load_rooms(departmentID, pageSize, page)

            setPopupOptions({
                Heading: "Delete Success",
                HeadingStyle: { background: "green", color: "white" },
                Message: 'the room was succesfully deleted'
            })
        } catch (err) {
            setPopupOptions({
                Heading: "Delete Failed",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            })
        }

        setRoomToDelete(null)
        setLoading(false);
        setIsDialogDeleteShow(false)

        console.log(`call: handleRoomDelete(${room_id})`)
    }

    const [room, setRoom] = useState({
        Name: null,
        Capacity: null,
        RoomType: null,
    })

    const [roomList, setRoomList] = useState([])

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

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

    const load_rooms = async (department_id, page_size, new_page) => {
        console.log('loading rooms for department id :', department_id)
        console.log('page_size :', page_size)
        console.log('page :', new_page)

        setLoading(true);

        try {
            const rooms = await fetchDepartmentRooms(department_id, page_size, new_page)
            console.log(`fetched rooms : ${rooms}`)

            setRoomList(rooms.Rooms)
            setTotalCount(rooms.TotalRooms)
        } catch (err) {
            setPopupOptions({
                Heading: "Failed to fetch rooms",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            })
        }

        setSharingDepartmentIDs([])
        setSharingDepartments([])

        setLoading(false);
    }

    const [departmentID, setDepartmentID] = useState("")
    const [department, setDepartment] = useState("")

    const [sharingDepartmentIDs, setSharingDepartmentIDs] = useState([])
    const [sharingDepartments, setSharingDepartments] = useState([])

    return (<>
        <MainHeader pageName={'rooms'} />

        <Popup popupOptions={popupOptions} closeButtonActionHandler={() => {
            setPopupOptions(null);
        }} />

        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0.5em' }}>
                <FormControl sx={{ minWidth: 130 }} size="small">
                    <InputLabel id="label-id-department">Department</InputLabel>
                    <Select
                        id="id-department" labelId="label-id-department" label="Department"
                        value={departmentID}
                        onChange={async (e) => {

                            const department_id = e.target.value

                            console.log(`selected departmentID: ${department_id}`)
                            setDepartmentID(department_id)

                            for (let i = 0; i < departmentList?.length; i++) {
                                if (departmentList[i].DepartmentID === department_id) {
                                    setDepartment(departmentList[i])
                                    break
                                }
                            }

                            setPage(0);
                            await load_rooms(department_id, pageSize, 0)
                        }}
                    >
                        {departmentList ?
                            departmentList.map((department_iter, index) => (
                                <MenuItem key={index} value={department_iter.DepartmentID}>{`${department_iter.Code}`}</MenuItem>
                            )) : null
                        }
                    </Select>
                </FormControl>

                {/* > new room will be a form dialog */}
                <Button disabled={!Number.isInteger(departmentID)}
                    endIcon={<AddIcon />} size="medium" color="secondary" variant="contained"
                    onClick={() => {
                        const new_empty_room_fields = {
                            Name: null,
                            Capacity: null,
                            RoomType: null,
                        }

                        setSharingDepartmentIDs([])
                        setSharingDepartments([])

                        setRoom(new_empty_room_fields)
                        console.log('new_empty_room_fields =', new_empty_room_fields)
                        setMode("new")
                        setIsDialogFormOpen(true)
                    }}
                >
                    Add New Room
                </Button>
            </Box>
            <Box
                padding={'1em'}
                display={'flex'}
                justifyContent={'space-between'}
            >
                <Typography>Rooms</Typography>
                <Typography fontStyle={'italic'}>{department ? `${department?.Name}` : null}</Typography>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ height: 1 }}>

                            <TableCell>Room ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Capacity</TableCell>
                            <TableCell>Room Type</TableCell>
                            {departmentID == 0 ? <TableCell>Department Sharing</TableCell> : null}
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{loading ? (
                        <TableRow>
                            <TableCell colSpan={departmentID == 0 ? 6 : 5} align="center">
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : (roomList?.map((room, index) => (
                        <TableRow key={room.RoomID} sx={{ border: '1px solid yellow' }}>
                            <TableCell>{room.RoomID}</TableCell>
                            <TableCell>{room.Name}</TableCell>
                            <TableCell>{room.Capacity}</TableCell>
                            <TableCell>{RoomTypeName(room.RoomType)}</TableCell>
                            {departmentID == 0 ? <TableCell>{room?.SharingDepartments ? `${room?.SharingDepartments?.length}x` : 'all'}</TableCell> : null}
                            <TableCell align="right">
                                <Button
                                    variant="contained" color="primary" size="small"
                                    style={{ marginRight: 8 }}
                                    startIcon={<EditIcon />}
                                    onClick={() => {
                                        if (room.SharingDepartments) {
                                            setSharingDepartmentIDs(room.SharingDepartments)

                                            const current_sharing_departments = room.SharingDepartments?.map((id) => {
                                                return departmentList.find((find_dept) => {
                                                    return id == find_dept.DepartmentID;
                                                })
                                            })

                                            setSharingDepartments(current_sharing_departments)
                                        } else {
                                            setSharingDepartmentIDs([])
                                            setSharingDepartments([])
                                        }

                                        setRoom(room)
                                        console.log(room)
                                        setMode("edit")
                                        setIsDialogFormOpen(true)
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained" color="error" size="small" endIcon={<DeleteIcon />}
                                    onClick={async () => {
                                        setRoomToDelete(room)
                                        setIsDialogDeleteShow(true)
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

                    onPageChange={async (_, new_page) => {
                        console.log('handleChangePage :', new_page)
                        setPage(new_page);
                        await load_rooms(departmentID, pageSize, new_page)
                    }}

                    onRowsPerPageChange={async (event) => {
                        setPageSize(parseInt(event.target.value, 10));
                        setPage(0);
                        await load_rooms(departmentID, parseInt(event.target.value, 10), 0)
                    }}
                />
            </TableContainer>
        </Box>

        {/* delete dialog */}
        <Dialog
            open={isDialogDeleteShow}
            onClose={() => {
                setIsDialogDeleteShow(false)
                setRoomToDelete(null)
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Remove Room
            </DialogTitle>

            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {`Are you sure you want to remove "${roomToDelete?.Name}"?`}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        handleRoomDelete(roomToDelete?.RoomID)
                    }}
                >Yes
                </Button>

                <Button
                    onClick={() => {
                        setIsDialogDeleteShow(false)
                    }}
                >
                    No
                </Button>
            </DialogActions>
        </Dialog>

        {/* add/edit room dialog */}
        <Dialog
            open={isDialogFormOpen}

            onClose={() => {
                setIsDialogFormOpen(false)
            }}

            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: async (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());

                        if (mode === "new") {
                            console.log('adding new room to department id : ', departmentID)
                            formJson.DepartmentID = departmentID
                        } else {
                            formJson.DepartmentID = Number(formJson.DepartmentID)
                        }

                        if (departmentID == 0) {
                            formJson.SharingDepartments = sharingDepartmentIDs
                        } else {
                            formJson.SharingDepartments = []
                        }

                        formJson.Capacity = Number(formJson.Capacity)
                        formJson.RoomType = Number(formJson.RoomType)

                        try {
                            setLoading(true);

                            if (mode === "edit") {
                                formJson.RoomID = room.RoomID
                                console.log('updating room :', formJson);
                                await patchUpdateRoom(formJson);

                                setPopupOptions({
                                    Heading: "Edit Successful",
                                    HeadingStyle: { background: "green", color: "white" },
                                    Message: "changes to the room data are saved"
                                });
                            } else if (mode === "new") {
                                console.log('adding room :', formJson);
                                await postCreateRoom(formJson);

                                setPopupOptions({
                                    Heading: "Add Successful",
                                    HeadingStyle: { background: "green", color: "white" },
                                    Message: "a new room was added"
                                });
                            }

                            load_rooms(departmentID, pageSize, page)
                            setLoading(false);
                        } catch (err) {
                            setPopupOptions({
                                Heading: "Room Update Failed",
                                HeadingStyle: { background: "red", color: "white" },
                                Message: `${err}`
                            });
                            setLoading(false);
                        } finally {
                            setSharingDepartmentIDs([])
                            setSharingDepartments([])
                        }

                        setIsDialogFormOpen(false)
                    },
                },
            }}
        >
            <DialogTitle>{
                mode === "new" ? ('Add New Room') : (mode === "edit" ? ('Edit Room') : 'Temp Title')
            }</DialogTitle>
            <DialogContent>
                <DialogContentText>{
                    mode === "new" ? (
                        'Enter the room details and save it to add a new room.'
                    ) : (mode === "edit" ? (
                        "Edit the current room information and apply your changes"
                    ) : (
                        'This is a temporary development and debugging content only'
                    ))
                }</DialogContentText>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="Name"
                    name="Name"
                    label="Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    defaultValue={room?.Name ? room?.Name : ""}
                />

                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="Capacity"
                    name="Capacity"
                    label="Capacity"
                    type="number"
                    fullWidth
                    variant="standard"
                    defaultValue={room?.Capacity ? room?.Capacity : ""}
                />

                <FormControl
                    fullWidth
                    margin="dense"
                >
                    <InputLabel id="label-RoomType">Room Type</InputLabel>
                    <Select
                        onFocus={false}
                        required
                        variant="standard"
                        name="RoomType"
                        label="RoomType"
                        id="RoomType" labelId="label-RoomType"
                        value={Number.isInteger(room?.RoomType) ? room?.RoomType : ""}
                        onChange={(e) => {
                            const new_room = structuredClone(room)
                            console.log('e.target.value =', e.target.value)
                            new_room.RoomType = e.target.value
                            setRoom(new_room)
                        }}
                    >
                        {ROOM_TYPES ?
                            ROOM_TYPES.map((room_type, index) => (
                                <MenuItem key={index} value={room_type}>{`${RoomTypeName(room_type)}`}</MenuItem>
                            )) : null
                        }
                    </Select>
                </FormControl>

                {mode === "edit" ?
                    <FormControl
                        fullWidth
                        margin="dense"
                    >
                        <InputLabel id="label-id-edit-department">Move to Department</InputLabel>
                        <Select
                            onFocus={false}
                            required
                            variant="standard"
                            name="DepartmentID"
                            label="DepartmentID"
                            id="id-edit-department" labelId="label-id-edit-department"
                            value={Number.isInteger(room?.DepartmentID) ? room?.DepartmentID : ""}
                            onChange={(e) => {
                                const new_room = structuredClone(room)
                                console.log('e.target.value =', e.target.value)
                                new_room.DepartmentID = e.target.value
                                setRoom(new_room)
                            }}
                        >
                            {departmentList ?
                                departmentList.map((department, index) => {
                                    return <MenuItem key={index} value={department.DepartmentID}>{`${department.Code} - ${department.Name}`}</MenuItem>
                                }) : null
                            }
                        </Select>
                    </FormControl> : null
                }

                {(departmentID == 0 && departmentList) ? (<>
                    <FormControl sx={{ m: 1 }} fullWidth>
                        <InputLabel id="multiple-department-checkbox-label">Sharing Departments</InputLabel>
                        <Select
                            labelId="multiple-department-checkbox-label"
                            id="multiple-department-checkbox"
                            multiple
                            name="SharingDepartments"
                            value={sharingDepartmentIDs}
                            onChange={(event) => {
                                const {
                                    target: { value },
                                } = event;

                                console.log('value : ', value)
                                console.log('event : ', event)

                                setSharingDepartmentIDs(
                                    typeof value === 'string' ? value.split(',') : value,
                                );

                                const current_sharing_departments = value.map((id) => {
                                    return departmentList.find((find_dept) => {
                                        return id == find_dept.DepartmentID;
                                    })
                                })

                                setSharingDepartments(current_sharing_departments)

                                console.log('current sharing departments :', sharingDepartmentIDs)
                                console.log('current sharing departments :', current_sharing_departments)
                            }}
                            input={<OutlinedInput label="Sharing Departments" />}
                            renderValue={(selected) => (selected?.length === 0) ? 'Shared to All' : selected.join(', ')}
                        >
                            {departmentList.map((department) => (
                                <MenuItem key={department.DepartmentID} value={Number.parseInt(department.DepartmentID, 10)}>
                                    <Checkbox checked={sharingDepartmentIDs.includes(Number.parseInt(department.DepartmentID, 10))} />
                                    <ListItemText primary={department.Name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box display={'flex'} flexWrap={'wrap'} gap={1} padding={'0.3em'}>{(sharingDepartments?.length > 0) ? sharingDepartments.map((department) => (
                        <Chip
                            key={`chip-key-${department.DepartmentID}`}
                            label={`${department.DepartmentID} | ${department.Name}`}
                            onDelete={() => {
                                setSharingDepartments(
                                    sharingDepartments.filter(iter_dept => iter_dept?.DepartmentID != department?.DepartmentID)
                                )

                                setSharingDepartmentIDs(
                                    sharingDepartmentIDs.filter(id => id != department?.DepartmentID)
                                )
                            }}
                        />
                    )) : <Typography>Shared By All Departments</Typography>}
                    </Box>
                </>) : null

                }


            </DialogContent>
            <DialogActions>
                <Button type="submit">{
                    mode === "new" ? ('Save') : (mode === "edit" ? ('Apply Changes') : 'Temp Success')
                }</Button>
                <Button onClick={() => {
                    setSharingDepartmentIDs([])
                    setSharingDepartments([])
                    setIsDialogFormOpen(false)
                }}>Cancel</Button>
            </DialogActions>
        </Dialog>
    </>)
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <Rooms />
        </ThemeProvider>
    </StrictMode>
);
