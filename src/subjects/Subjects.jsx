import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import {
    Box, TextField, Button, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    Paper, CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions,
    FormControlLabel, Checkbox,
} from "@mui/material";

import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import "../assets/main.css";
import { fetchSubjects, deleteRemoveSubject, patchUpdateSubject, postCreateSubject } from "../js/subjects";
import { Popup } from "../components/Loading";

const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
};

function Subjects() {
    const [mode, setMode] = useState(""); // "new" or "edit"
    const [isDialogFormOpen, setIsDialogFormOpen] = useState(false);
    const [popupOptions, setPopupOptions] = useState(null);
    const [isDialogDeleteShow, setIsDialogDeleteShow] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const [subject, setSubject] = useState({
        Code: "",
        Name: "",
        LecHours: 0,
        LabHours: 0,
    });

    const [subjectList, setSubjectList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [codeFilter, setCodeFilter] = useState("");
    const [nameFilter, setNameFilter] = useState("");

    const [jumpToPage, setJumpToPage] = useState('');

    const totalPages = Math.ceil(totalCount / pageSize);

    const load_subjects = async (page_size, new_page, code_match = "", name_match = "") => {
        setLoading(true);
        try {
            const subjectsData = await fetchSubjects(page_size, new_page, code_match, name_match);
            setSubjectList(subjectsData.Subjects);
            setTotalCount(subjectsData.TotalSubjects);
        } catch (err) {
            setPopupOptions({
                Heading: "Failed to Fetch Subjects",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err.message}`,
            });
        }
        setLoading(false);
    };

    const handleSubjectDelete = async (subject_id) => {
        setLoading(true);
        try {
            await deleteRemoveSubject(subject_id);
            await load_subjects(pageSize, page, codeFilter, nameFilter);
            setPopupOptions({
                Heading: "Delete Success",
                HeadingStyle: { background: "green", color: "white" },
                Message: "The subject was successfully deleted",
            });
        } catch (err) {
            setPopupOptions({
                Heading: "Delete Failed",
                HeadingStyle: { background: "red", color: "white" },
                Message: `${err.message}`,
            });
        }
        setSubjectToDelete(null);
        setLoading(false);
        setIsDialogDeleteShow(false);
    };

    const handleJumpToPage = () => {
        const pageNumber = parseInt(jumpToPage, 10);
        if (pageNumber > 0 && pageNumber <= totalPages) {
            const newPage = pageNumber - 1; // Convert to 0-based index
            setPage(newPage);
            load_subjects(pageSize, newPage, codeFilter, nameFilter);
            setJumpToPage('');
        } else {
            setPopupOptions({
                Heading: "Invalid Page",
                HeadingStyle: { background: "orange", color: "white" },
                Message: `Please enter a page number between 1 and ${totalPages}`,
            });
        }
    };

    useEffect(() => {
        load_subjects(pageSize, page, codeFilter, nameFilter);
    }, []);

    return (
        <>
            <Popup popupOptions={popupOptions} closeButtonActionHandler={() => setPopupOptions(null)} />

            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0.5em' }}>
                    <Typography>Subjects</Typography>
                    <Button
                        endIcon={<AddIcon />}
                        size="medium"
                        color="secondary"
                        variant="contained"
                        onClick={() => {
                            setSubject({ Code: "", Name: "", LecHours: 0, LabHours: 0 });
                            setMode("new");
                            setIsDialogFormOpen(true);
                        }}
                    >
                        Add New Subject
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                        size="small"
                        label="Filter by Code"
                        value={codeFilter}
                        onChange={(e) => setCodeFilter(e.target.value)}
                    />
                    <TextField
                        size="small"
                        label="Filter by Name"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                            setPage(0);
                            load_subjects(pageSize, 0, codeFilter, nameFilter);
                        }}
                    >
                        Apply Filters
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Lec Hours</TableCell>
                                <TableCell>Lab Hours</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subjectList.map((subject) => (
                                    <TableRow key={subject.ID}>
                                        <TableCell>{subject.ID}</TableCell>
                                        <TableCell>{subject.Code}</TableCell>
                                        <TableCell>{truncateText(subject.Name, 90)}</TableCell>
                                        <TableCell>{subject.LecHours}</TableCell>
                                        <TableCell>{subject.LabHours}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                style={{ marginRight: 8 }}
                                                startIcon={<EditIcon />}
                                                onClick={() => {
                                                    setSubject(subject);
                                                    setMode("edit");
                                                    setIsDialogFormOpen(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                endIcon={<DeleteIcon />}
                                                onClick={() => {
                                                    setSubjectToDelete(subject);
                                                    setIsDialogDeleteShow(true);
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15]}
                            component="div"
                            count={totalCount}
                            rowsPerPage={pageSize}
                            page={page}
                            onPageChange={async (_, new_page) => {
                                setPage(new_page);
                                await load_subjects(pageSize, new_page, codeFilter, nameFilter);
                            }}
                            onRowsPerPageChange={async (event) => {
                                const newPageSize = parseInt(event.target.value, 10);
                                setPageSize(newPageSize);
                                setPage(0);
                                await load_subjects(newPageSize, 0, codeFilter, nameFilter);
                            }}
                        />
                        {/* page jump controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{`${page+1}/${totalPages}`}</Typography>
                            <TextField
                                label="Go to page"
                                type="number"
                                value={jumpToPage}
                                onChange={(e) => setJumpToPage(e.target.value)}
                                slotProps={{htmlInput: { min: 1, max: totalPages }}}
                                size="small"
                                style={{ width: '100px' }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleJumpToPage}
                                size="small"
                            >
                                Go
                            </Button>
                        </Box>
                    </Box>
                </TableContainer>
            </Box>

            <Dialog
                open={isDialogDeleteShow}
                onClose={() => setIsDialogDeleteShow(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Remove Subject</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {`Are you sure you want to remove "${subjectToDelete?.Name}"?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleSubjectDelete(subjectToDelete?.ID)}>Yes</Button>
                    <Button onClick={() => setIsDialogDeleteShow(false)}>No</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isDialogFormOpen}
                onClose={() => setIsDialogFormOpen(false)}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: async (event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries(formData.entries());

                            const isGym = formJson.isGym === "on";
                            const subjectData = {
                                Code: formJson.Code,
                                Name: formJson.Name,
                                LecHours: parseInt(formJson.LecHours, 10),
                                LabHours: parseInt(formJson.LabHours, 10),
                                BitFlags: isGym ? 1 : 0,
                                DesignatedInstructors: [],
                            };

                            if (mode === "edit") {
                                subjectData.ID = subject.ID;
                            }

                            try {
                                setLoading(true);
                                if (mode === "new") {
                                    await postCreateSubject(subjectData);
                                    setPopupOptions({
                                        Heading: "Add Successful",
                                        HeadingStyle: { background: "green", color: "white" },
                                        Message: "A new subject was added",
                                    });
                                } else if (mode === "edit") {
                                    await patchUpdateSubject(subjectData);
                                    setPopupOptions({
                                        Heading: "Edit Successful",
                                        HeadingStyle: { background: "green", color: "white" },
                                        Message: "Changes to the subject data are saved",
                                    });
                                }
                                await load_subjects(pageSize, page, codeFilter, nameFilter);
                            } catch (err) {
                                setPopupOptions({
                                    Heading: "Operation Failed",
                                    HeadingStyle: { background: "red", color: "white" },
                                    Message: `${err.message}`,
                                });
                            } finally {
                                setLoading(false);
                                setIsDialogFormOpen(false);
                            }
                        },
                    },
                }}
            >
                <DialogTitle>{mode === "new" ? "Add New Subject" : "Edit Subject"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {mode === "new" ? "Enter the subject details and save it to add a new subject." : "Edit the current subject information and apply your changes"}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="Code"
                        name="Code"
                        label="Code"
                        type="text"
                        fullWidth
                        variant="standard"
                        defaultValue={subject?.Code || ""}
                    />
                    <TextField
                        required
                        margin="dense"
                        id="Name"
                        name="Name"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        defaultValue={subject?.Name || ""}
                    />
                    <TextField
                        required
                        margin="dense"
                        id="LecHours"
                        name="LecHours"
                        label="Lecture Hours"
                        type="number"
                        fullWidth
                        variant="standard"
                        defaultValue={subject?.LecHours || 0}
                        slotProps={{htmlInput: { min: 0, max: 15 }}}
                    />
                    <TextField
                        required
                        margin="dense"
                        id="LabHours"
                        name="LabHours"
                        label="Lab Hours"
                        type="number"
                        fullWidth
                        variant="standard"
                        defaultValue={subject?.LabHours || 0}
                        slotProps={{htmlInput: { min: 0, max: 15 }}}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="isGym"
                                defaultChecked={mode === "edit" && (subject?.BitFlags & 1) === 1}
                            />
                        }
                        label="Is Gym Type"
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit">{mode === "new" ? "Save" : "Apply Changes"}</Button>
                    <Button onClick={() => setIsDialogFormOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Subjects />
    </StrictMode>
);