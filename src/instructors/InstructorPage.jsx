import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import SearchIcon from '@mui/icons-material/Search';

import { Loading, Popup } from "../components/Loading";

import "../assets/main.css";
import "./TimeTable.css";
import DeleteIcon from '@mui/icons-material/Delete';


import "./TimeTableDropdowns.css";
import "./instructors.css";

import { fetchAllDepartments } from "../js/departments"
import { fetchInstructors, fetchInstructorResources } from "../js/instructors_v2"

import VisibilityIcon from '@mui/icons-material/Visibility';

import { Box, FormControl, InputLabel, MenuItem, Select, Button, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, TablePagination, Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import { InstructorTimeSlotBitMap } from "../js/instructor-time-slot-bit-map"
import InstructorDataView from "./InstructorDataView"
import { deleteRemoveInsturctor } from "../js/instructors";

import { MainHeader } from "../components/Header";

function InstructorPage() {
    const [mode, setMode] = useState("") // 3 mode - new, view, edit
    const [popupOptions, setPopupOptions] = useState(null);

    const [instructors, setInstructors] = useState([]) // load array of instructs when a department is selected
    const [selectedInstructor, setSelectedInstructor] = useState(null)

    /////////////////////////////////////////////////////////////////////////////////
    //                     LOAD GUARD COMPONENT STATES
    /////////////////////////////////////////////////////////////////////////////////

    const [IsLoading, setIsLoading] = useState(false);

    /////////////////////////////////////////////////////////////////////////////////
    //                       STATES FOR FETCHED DATA
    /////////////////////////////////////////////////////////////////////////////////

    const [departments, setDepartments] = useState([]); // fetch on page load

    useEffect(() => {
        const useEffectAsyncs = async () => {
            try {
                setIsLoading(true);
                const all_departments = await fetchAllDepartments();
                setDepartments(all_departments);
                setIsLoading(false);
            } catch (err) {
                setPopupOptions({
                    Heading: "Failed to Fetch All Department Data",
                    HeadingStyle: { background: "red", color: "white" },
                    Message: `${err}`
                });
                setIsLoading(false);
            }
        };

        useEffectAsyncs();
    }, []);


    const load_instructors = async (department_id, page_size, new_page, firstname_match, middle_initial_match, lastname_match) => {
        setLoading(true);
        try {
            const fetched_instructors = await fetchInstructors(department_id, page_size, new_page, firstname_match, middle_initial_match, lastname_match)
            setInstructors(fetched_instructors.Instructors);
            setTotalCount(fetched_instructors.TotalInstructors)
        } catch (err) {
            setPopupOptions({
                Heading: "Failed to fetch instructors",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            })
        }

        setLoading(false);

        for (let i = 0; i < departments?.length; i++) {
            if (departments[i].DepartmentID === department_id) {
                setSelectedDepartment(departments[i])
                setDepartmentID(departments[i].DepartmentID)
                break
            }
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    //                       DROPDOWN SELECTION STATES
    /////////////////////////////////////////////////////////////////////////////////

    const [departmentID, setDepartmentID] = useState(""); // use for department selection drop down
    const [selectedDepartment, setSelectedDepartment] = useState("") // will be use when viewing the instructor to display which department name is that instructor


    /////////////////////////////////////////////////////////////////////////////////
    //                       PAGE LOAD PROCESS
    /////////////////////////////////////////////////////////////////////////////////


    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const handleChangePage = async (event, new_page) => {
        await load_instructors(departmentID, pageSize, new_page, firstNameMatch, middleInitialMatch, lastNameMatch)
        setPage(new_page);
    };

    const handleChangeRowsPerPage = async (event) => {
        const new_page_size = parseInt(event.target.value, 10);
        await load_instructors(departmentID, new_page_size, 0, firstNameMatch, middleInitialMatch, lastNameMatch)
        setPageSize(new_page_size);
        setPage(0); // go back to first page when page row size was changed
    };

    const [isDialogDeleteShow, setIsDialogDeleteShow] = useState(false)
    const [instructorToDelete, setInstructorToDelete] = useState(null)
    const handleInstructorDelete = async (instructor_id) => {
        setLoading(true);

        try {
            await deleteRemoveInsturctor(instructor_id);
            await load_instructors(departmentID, pageSize, page, firstNameMatch, middleInitialMatch, lastNameMatch)
        } catch (err) {
            setPopupOptions({
                Heading: "Delete Failed",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            })
        }

        setLoading(false);
        setIsDialogDeleteShow(false)

        console.log(`call: handleInstructorDelete(${instructor_id})`)
    }

    const [firstNameMatch, setFirstNameMatch] = useState("");
    const [middleInitialMatch, setMiddleInitialMatch] = useState("");
    const [lastNameMatch, setLastNameMatch] = useState("");

    const handleDepartmentChange = async (e) => {
        await load_instructors(e.target.value, pageSize, 0, firstNameMatch, middleInitialMatch, lastNameMatch);
        setPage(0);
    }

    return (<>
        <MainHeader pageName={'instructors'}/>

        <Popup popupOptions={popupOptions} closeButtonActionHandler={() => {
            setPopupOptions(null);
        }} />

        <Loading
            IsLoading={IsLoading}
        />

        <Box display={!mode ? 'block' : 'none'}>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2, padding: '1em' }}>
                <FormControl sx={{ minWidth: 130 }} size="small">
                    <InputLabel id="label-id-department">Department</InputLabel>
                    <Select
                        id="id-department" labelId="label-id-department" label="Department"
                        value={departmentID}
                        onChange={handleDepartmentChange}
                    >
                        {departments ?
                            departments.map((department, index) => (
                                <MenuItem key={index} value={department.DepartmentID}>{`${department.Code} - ${department.Name}`}</MenuItem>
                            )) : null
                        }
                    </Select>
                </FormControl>

                <TextField
                    sx={{ width: '15em' }}
                    size="small"
                    label="First Name"
                    defaultValue={firstNameMatch}
                    onChange={(e) => setFirstNameMatch(e.target.value)}
                />
                <TextField
                    sx={{ width: '15em' }}
                    size="small"
                    label="Middle Initial"
                    defaultValue={middleInitialMatch}
                    onChange={(e) => setMiddleInitialMatch(e.target.value)}
                />
                <TextField
                    sx={{ width: '17em' }}
                    size="small"
                    label="Last Name"
                    defaultValue={lastNameMatch}
                    onChange={(e) => setLastNameMatch(e.target.value)}
                />

                <Button
                    disabled={!departmentID}
                    size="small"
                    variant="contained"
                    onClick={async () => {
                        setPage(0);
                        console.log('departmentID : ', departmentID)
                        load_instructors(departmentID, pageSize, 0, firstNameMatch, middleInitialMatch, lastNameMatch);
                    }}
                ><SearchIcon /></Button>

                {/* <FormControl sx={{ minWidth: 115 }} size="small">
                    <InputLabel id="label-id-semester">Semester</InputLabel>
                    <Select autoWidth
                        labelId="label-id-semester"
                        label="Semester"
                        value={semesterIndex}
                        onChange={handleSemesterChange}
                        disabled={!Number.isInteger(departmentID)}
                    >
                        <MenuItem value={0}>1st Semester</MenuItem>
                        <MenuItem value={1}>2nd Semester</MenuItem>
                    </Select>
                </FormControl> */}

                <Box style={{ width: '100%', display: 'flex', justifyContent: 'right' }}>
                    <Button disabled={!Number.isInteger(departmentID)}
                        endIcon={<AddIcon />} size="small" color="secondary" variant="contained"
                        onClick={() => {
                            setIsLoading(true)

                            const new_instructor = {
                                DepartmentID: departmentID,
                                FirstName: "",
                                LastName: "",
                                MiddleInitial: "",
                            }

                            setSelectedInstructor(new_instructor)
                            setIsLoading(false)

                            setMode("new")
                        }}
                        loading={IsLoading}
                    >
                        Add New Instructor
                    </Button>
                </Box>
            </Box>

            <Typography marginInline={'0.5em'} variant="h5" sx={{ textAlign: 'left' }} >Instructors</Typography>
        </Box >

        {mode === "" ? <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ height: 1 }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Last Name</TableCell>
                        <TableCell>First Name</TableCell>
                        <TableCell>Middle Initial</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : (
                        instructors.map((instructor, index) => (
                            <TableRow key={instructor.InstructorID} sx={{ border: '1px solid yellow' }}>
                                <TableCell>{instructor.InstructorID}</TableCell>
                                <TableCell>{instructor.LastName}</TableCell>
                                <TableCell>{instructor.FirstName}</TableCell>
                                <TableCell>{instructor.MiddleInitial}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="contained" color="primary" size="small"
                                        style={{ marginRight: 8 }}
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => {
                                            setSelectedInstructor(instructor)
                                            setMode("view")
                                        }}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="contained" color="error" size="small" endIcon={<DeleteIcon />}
                                        onClick={() => {
                                            setInstructorToDelete(instructor)
                                            setIsDialogDeleteShow(true)
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
                rowsPerPageOptions={[1, 5, 10, 15]}
                component="div"
                count={totalCount}
                rowsPerPage={pageSize}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer> : null}

        <Dialog
            open={isDialogDeleteShow}
            onClose={() => {
                setIsDialogDeleteShow(false)
                setInstructorToDelete(null)
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Remove Instructor
            </DialogTitle>

            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {`Are you sure you want to remove "${instructorToDelete?.FirstName} ${instructorToDelete?.MiddleInitial} ${instructorToDelete?.LastName}"?`}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        handleInstructorDelete(instructorToDelete?.InstructorID)
                    }}
                >Yes
                </Button>

                <Button
                    onClick={() => {
                        setIsDialogDeleteShow(false)
                        console.log("delete dialog 'No' click : red -", reducer)
                    }}
                >
                    No
                </Button>
            </DialogActions>
        </Dialog>

        {mode === "" ? null : <InstructorDataView
            mode={mode}
            setMode={setMode}
            selectedDepartment={selectedDepartment}
            selectedInstructor={selectedInstructor}
            setSelectedInstructor={setSelectedInstructor}
            onInstructorDataViewClose={() => {
                setMode("")
                setSelectedInstructor(null)
            }}
            reloadInstructorsTable={async () => {
                await load_instructors(departmentID, pageSize, page, firstNameMatch, middleInitialMatch, lastNameMatch)
            }}
            departments={departments}
        />}
    </>);
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <InstructorPage />
    </StrictMode>
);
