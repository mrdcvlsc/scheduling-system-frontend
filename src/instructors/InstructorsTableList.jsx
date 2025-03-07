import React, { useState, useEffect, useReducer } from "react";

import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, CircularProgress,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions
} from "@mui/material";

import DeleteIcon from '@mui/icons-material/Delete';
import { InstructorTimeSlotBitMap } from "../js/instructor-time-slot-bit-map"
import VisibilityIcon from '@mui/icons-material/Visibility';

import { fetchDepartmentInstructorsDefaults, fetchDepartmentInstructorsAllocated, deleteRemoveInsturctor } from "../js/instructors";

import { Popup } from "../components/Loading";

function InstructorTableList({ DepartmentID, Semester, SetPopUpOptions, setSelectedInstructorDefault, setSelectedInstructorAllocated, isView, setIsView, setMode }) {
    const [isDialogDeleteShow, setIsDialogDeleteShow] = useState(false)

    const [instructorsDefaults, setInstructorsDefaults] = useState([]);
    const [instructorsAllocated, setInstructorsAllocated] = useState([]);

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [reducer, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        console.log('InstructorTable.useEffect')
        const fetchInstructors = async () => {
            setLoading(true);

            try {
                const instructors_defaults = await fetchDepartmentInstructorsDefaults(DepartmentID, Semester, pageSize, page);

                for (let i = 0; i < instructors_defaults.Instructors.length; i++) {
                    instructors_defaults.Instructors[i].Time = new InstructorTimeSlotBitMap(instructors_defaults.Instructors[i].Time);
                }

                const instructors_allocated = await fetchDepartmentInstructorsAllocated(DepartmentID, Semester, pageSize, page);

                for (let i = 0; i < instructors_allocated.Instructors.length; i++) {
                    instructors_allocated.Instructors[i].Time = new InstructorTimeSlotBitMap(instructors_allocated.Instructors[i].Time);
                }

                setInstructorsDefaults(instructors_defaults.Instructors)
                console.log('instructors_defaults :')
                console.log(instructors_defaults);
                console.log()

                setInstructorsAllocated(instructors_allocated.Instructors)
                console.log('instructors_allocated :')
                console.log(instructors_allocated);
                console.log()

                setTotalCount(instructors_defaults.TotalInstructors)
            } catch (err) {
                SetPopUpOptions({
                    Heading: "Failed to fetch instructors",
                    HeadingStyle: { background: "red", color: "white" },
                    Message: `${err}`
                })
            }

            setLoading(false);
        };

        fetchInstructors();
    }, [DepartmentID, Semester, page, pageSize, isView, reducer]); // Refetch when page/rowsPerPage changes

    // Handle page change
    const handleChangePage = (event, new_page) => {
        setPage(new_page);
        setIsView(false)
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page
    };

    const handleInstructorSelection = (defaults_idx) => {
        let allocated_idx = -1

        for (let i = 0; i < instructorsAllocated.length; i++) {
            if (instructorsDefaults[defaults_idx].InstructorID === instructorsAllocated[i].InstructorID) {
                allocated_idx = i
                break
            }
        }

        if (allocated_idx < 0) {
            SetPopUpOptions({
                Heading: "Incorrect Data",
                HeadingStyle: { background: "red", color: "white" },
                Message: "missing default instructor encoding resources"
            });
        } else {
            setSelectedInstructorDefault(instructorsDefaults[defaults_idx])
            setSelectedInstructorAllocated(instructorsAllocated[allocated_idx])

            console.log('selected instructor defaults index :', defaults_idx)

            console.log('instructorsDefaults[defaults_idx] :')
            console.log(instructorsDefaults[defaults_idx])

            console.log('instructorsAllocated[allocated_idx] :')
            console.log(instructorsAllocated[allocated_idx])
        }
    }

    const handleInstructorDelete = async (instructor_id) => {

        setLoading(true);

        try {
            await deleteRemoveInsturctor(instructor_id);
            forceUpdate()
        } catch (err) {
            SetPopUpOptions({
                Heading: "Delete Failed",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err}`
            })
        }

        setLoading(false);
        setIsDialogDeleteShow(false)
    
        console.log(`call: handleInstructorDelete(${instructor_id})`)
    }

    const [instructorToDelete, setInstructorToDelete] = useState(null)

    return (<>
        <TableContainer component={Paper}>
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
                            <TableCell align="center">
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : (
                        instructorsDefaults.map((instructor, index) => (
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
                                            handleInstructorSelection(index)
                                            setIsView(true)
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
        </TableContainer>

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
    </>);
}

export default InstructorTableList;
