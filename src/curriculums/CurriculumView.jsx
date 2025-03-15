import { useState, useEffect } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import "../assets/main.css";

import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, IconButton, CircularProgress, Checkbox, FormControlLabel,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    FormGroup,
    DialogContentText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import { loadCurriculum, postCreateCurriculum, patchUpdateCurriculum } from '../js/curriculums';
import { Popup } from '../components/Loading';

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { CheckBox } from '@mui/icons-material';

const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
};

const YEAR_LEVEL_NAMES = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year", "7th Year", "8th Year"]
const SEMESTER_NAMES = ["1st Semester", "2nd Semester"]

function CurriculumView({ mode, setMode, curriculum_id, department, setPopupOptions, onClose }) {
    const [isLoading, setIsLoading] = useState(false)
    const [curriculum, setCurriculum] = useState(null)
    const [editedCurriculum, setEditedCurriculum] = useState(null)

    useEffect(() => {
        console.log('load mode :', mode)
        const useEffectAsyncs = async () => {
            try {
                if (mode === "new") {
                    const new_curriculum = {
                        CurriculumCode: "",
                        CurriculumID: 0,
                        CurriculumName: "",
                        DepartmentID: department.DepartmentID,
                        YearLevels: []
                    }
                    setCurriculum(new_curriculum);
                    setEditedCurriculum(structuredClone(new_curriculum));
                    return
                }

                setIsLoading(true);
                const loaded_curriculum = await loadCurriculum(curriculum_id);

                if (!loaded_curriculum) {
                    throw "Curriculum not found"
                }

                setCurriculum(loaded_curriculum);
                setEditedCurriculum(structuredClone(loaded_curriculum));
                console.log('loaded_curriculum:')
                console.log(loaded_curriculum)
                setIsLoading(false);
            } catch (err) {
                setPopupOptions({
                    Heading: "Failed to fetch specific curriculum data",
                    HeadingStyle: { background: "red", color: "white" },
                    Message: `${err}`
                });
                setIsLoading(false);
                setSemesterIndex("");
            }
        }

        useEffectAsyncs()
    }, [])

    const [isDialogFormOpen, setIsDialogFormOpen] = useState(false);
    const [subject, setSubject] = useState({
        LecHours: 0,
        LabHours: 0,
    });

    return !isLoading ? (<>
        <Box display={'flex'} justifyContent={'space-between'} borderBottom={'gray solid thin'} padding={'0.5em'}>
            {(mode === "view") ?
                (<Typography variant='h6'>{curriculum?.CurriculumCode}</Typography>) :
                (<TextField
                    autoFocus
                    required
                    id="id-curriculum-code"
                    name="id-curriculum-code"
                    label="Curriculum Code"
                    type="text"
                    variant="outlined"
                    size='small'
                    defaultValue={editedCurriculum?.CurriculumCode || ""}
                />)
            }
            <Box display={'flex'} gap={'0.5em'}>
                {(mode === "view") ? (<>
                    <Button
                        endIcon={<EditIcon />} size="small" color="primary" variant="contained"
                        onClick={() => {
                            console.log('mode :', mode)
                            setMode("edit")
                            setEditedCurriculum(structuredClone(curriculum))
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        endIcon={<ClearIcon />} size="small" color="error" variant="outlined"
                        onClick={() => onClose()}
                    >
                        Close
                    </Button>
                </>) : null}

                {(mode === "edit") ? (<>
                    <Button
                        endIcon={<CheckIcon />} size="small" color="primary" variant="contained"
                        onClick={() => {
                            console.log('mode :', mode)

                            // if backend request success
                            setCurriculum(structuredClone(editedCurriculum))
                            setMode("view")
                        }}
                    >
                        Apply Changes
                    </Button>
                    <Button
                        endIcon={<CancelIcon />} size="small" color="error" variant="outlined"
                        onClick={() => {
                            setMode("view")
                            setEditedCurriculum(structuredClone(curriculum))
                        }}
                    >
                        Cancel Changes
                    </Button>
                </>) : null}

                {(mode === "new") ? (<>
                    <Button
                        endIcon={<SaveIcon />} size="small" color="primary" variant="contained"
                        onClick={() => {
                            console.log('mode :', mode)
                            console.log(editedCurriculum)
                        }}
                    >
                        Save
                    </Button>
                    <Button
                        endIcon={<ClearAllIcon />} size="small" color="error" variant="outlined"
                        onClick={() => onClose()}
                    >
                        Discard
                    </Button>
                </>) : null}
            </Box>
        </Box>

        <Box display={'flex'} alignItems={'baseline'} justifyContent={'space-between'} borderBottom={'grey solid thick'} marginBottom={'0.2em'} padding={'0.5em 0.5em 0.2em 0.5em'}>
            {(mode === "view") ?
                <Typography variant='h6' width={'100%'}>{curriculum?.CurriculumName}</Typography> :
                (<TextField
                    autoFocus
                    required
                    id="id-curriculum-name"
                    name="id-curriculum-name"
                    label="Curriculum Name"
                    type="text"
                    variant="outlined"
                    size='small'
                    sx={{ width: '100%' }}
                    defaultValue={editedCurriculum?.CurriculumName || ""}
                />)
            }
            <Typography align='right' width={'100%'} variant='body1' fontStyle={'italic'}>{`${department?.Name}`}</Typography>
        </Box>

        <Box>
            {editedCurriculum?.YearLevels?.length !== 0 ? editedCurriculum?.YearLevels.map((year_level, index_year_level) => (<Accordion key={`accordion-id-curriculum-${index_year_level}`}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`yrlvl-panel${index_year_level + 1}-content`}
                    id={`${editedCurriculum?.CurriculumCode}-yrlvl-panel${index_year_level + 1}-header`}
                    sx={{
                        minHeight: '0px',
                        '&.Mui-expanded': {
                            minHeight: '0px',
                            color: 'whitesmoke',
                            backgroundColor: 'black',
                        },
                        padding: '0xp 0px',
                        height: '2.5em',
                        ":hover": { backgroundColor: 'orange' },
                    }}
                >
                    <Box margin={'0px'} display={'flex'} justifyContent={'space-between'} minWidth={'11em'}>
                        <Typography variant='body1' component="span">{year_level.Name}</Typography>
                        {(mode === "view") ? (<Typography variant='body1' component="span">{year_level?.IsActive ? '(Active)' : '(Inactive)'}</Typography>) : null}
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ minHeight: '0px', padding: '0.2em 1em 0.5em 1em' }}>
                    {(mode === "edit" || mode === "new") ? <Box display={'flex'} gap={'2em'} alignItems={'center'}>
                        <FormGroup>
                            <FormControlLabel control={
                                <Checkbox
                                    checked={year_level.IsActive}
                                    onChange={(e) => {
                                        console.log(e.target.checked)
                                        const new_curriculum = structuredClone(editedCurriculum);
                                        new_curriculum.YearLevels[index_year_level].IsActive = e.target.checked;
                                        setEditedCurriculum(new_curriculum);
                                    }}
                                />
                            } label="Active Year" />
                        </FormGroup>

                        <Button
                            size='small'
                            sx={{ minHeight: '10px', height: '2.3em' }}
                            variant='contained'
                            color="success"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                if (year_level.Semesters.length === SEMESTER_NAMES.length) {
                                    setPopupOptions({
                                        Heading: "Semester Limit Reach",
                                        HeadingStyle: { background: "yellow", color: "black" },
                                        Message: 'you can not add more semester to this year level',
                                    });
                                    return
                                }

                                const new_curriculum = structuredClone(editedCurriculum)
                                new_curriculum.YearLevels[index_year_level].Semesters.push({
                                    Name: SEMESTER_NAMES[new_curriculum.YearLevels[index_year_level].Semesters.length],
                                    Sections: 0,
                                    Subjects: []
                                })

                                setEditedCurriculum(new_curriculum)
                            }}
                        >
                            Add Semester
                        </Button>

                        <Button
                            size='small'
                            sx={{ minHeight: '10px', height: '2.3em' }}
                            variant='contained'
                            color="error"
                            endIcon={<RemoveIcon />}
                            onClick={() => {
                                if (year_level.Semesters.length === 0) {
                                    setPopupOptions({
                                        Heading: "Semester Limit Reach",
                                        HeadingStyle: { background: "yellow", color: "black" },
                                        Message: 'you can not decrease more semester to this year level',
                                    });
                                    return
                                }

                                const new_curriculum = structuredClone(editedCurriculum)
                                new_curriculum.YearLevels[index_year_level].Semesters.pop()
                                setEditedCurriculum(new_curriculum)
                            }}
                        >
                            Reduce Semester
                        </Button>
                    </Box> : null}
                    {year_level?.Semesters?.length !== 0 ? year_level?.Semesters.map((semester, index_semester) => (<Accordion key={`accordion-id-year-level-${editedCurriculum?.CurriculumCode}-${index_year_level}-${index_semester}`}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`sem-panel-${editedCurriculum?.CurriculumCode}-${index_year_level}-${index_semester + 1}-content`}
                            id={`sem-panel-${editedCurriculum?.CurriculumCode}-${index_year_level}-${index_semester + 1}-header`}
                            sx={{
                                minHeight: '0px',
                                '&.Mui-expanded': {
                                    minHeight: '0px',
                                    backgroundColor: 'darkgray',
                                    color: 'white'
                                },
                                padding: '0xp',
                                height: '2em',
                                ":hover": { backgroundColor: 'ButtonHighlight', color: 'black', outline: 'thin solid black' },
                            }}
                        >
                            <Typography variant='body2' component="span">{semester?.Name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ minHeight: '0px', padding: '0.3em', display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
                            <Box width={'100%'} display={'flex'} justifyContent={'space-between'} gap={'1em'} alignItems={'center'} paddingBlockEnd={'0px'}>
                                {(mode === "edit" || mode === "new") ? <>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ minHeight: '2px', height: '2.3em' }}
                                        size="small"
                                        endIcon={<AddIcon />}
                                    >
                                        Add Subject
                                    </Button>

                                    <TextField
                                        size='small'
                                        required
                                        id={`${editedCurriculum?.CurriculumCode}-${index_year_level}-${index_semester}-Sections`}
                                        sx={{ minWidth: '5em' }}
                                        name="Sections"
                                        label="Sections"
                                        type="number"
                                        variant="standard"
                                        defaultValue={semester?.Sections || 0}
                                        slotProps={{ htmlInput: { min: 0, max: 15 } }}
                                    />
                                </> : null}
                            </Box>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Code</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Lec Hrs</TableCell>
                                            <TableCell>Lab Hrs</TableCell>
                                            {(mode === "edit" || mode === "new") ? <TableCell align="right">Actions</TableCell> : null}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>{isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={(mode === "edit" || mode === "new") ? 6 : 5} align="center">
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>
                                    ) : (semester?.Subjects.map((subject, index_subject) => (
                                        <TableRow key={subject.ID}>
                                            <TableCell>{subject.ID}</TableCell>
                                            <TableCell>{subject.Code}</TableCell>
                                            <TableCell>{truncateText(subject.Name, 45)}</TableCell>
                                            <TableCell>{subject.LecHours}</TableCell>
                                            <TableCell>{subject.LabHours}</TableCell>
                                            {(mode === "edit" || mode === "new") ? <TableCell align='right'>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    style={{ marginRight: 8 }}
                                                    startIcon={<EditIcon />}
                                                    onClick={() => {
                                                        setSubject(subject);
                                                        setIsDialogFormOpen(true);
                                                    }}
                                                    sx={{ minHeight: '0px', fontSize: '0.8em', height: '2.2em', padding: '0px 0.8em', margin: '0px' }}
                                                >
                                                    Modify
                                                </Button>
                                                <Button
                                                    sx={{ minHeight: '0px', fontSize: '0.8em', height: '2.2em', padding: '0px 0.8em', margin: '0px' }}
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    endIcon={<RemoveCircleOutlineIcon />}
                                                    onClick={() => {
                                                        setIsLoading(true)
                                                        semester?.Subjects.splice(index_subject, 1)
                                                        setCurriculum(structuredClone(editedCurriculum))
                                                        setIsLoading(false)
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </TableCell> : null}
                                        </TableRow>
                                    )))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>)) : <Box padding={'1em'}><Typography fontStyle={'italic'}>empty semester</Typography></Box>}
                </AccordionDetails>
            </Accordion>)) : <Box padding={'1em'}><Typography fontStyle={'italic'}>empty year levels</Typography></Box>}
            <Box
                display={'flex'}
                justifyContent={'space-evenly'}
                padding={'0.5em'}
                gap={'3em'}
            >
                {(mode === "new" || mode === "edit") ? <>
                    <Button
                        variant='contained'
                        color="success"
                        fullWidth
                        size='small'
                        startIcon={<AddIcon />}
                        onClick={() => {
                            if (editedCurriculum.YearLevels.length === YEAR_LEVEL_NAMES.length) {
                                setPopupOptions({
                                    Heading: "Year Limit Reach",
                                    HeadingStyle: { background: "yellow", color: "black" },
                                    Message: 'you can not add more year level to this curriculum',
                                });
                                return
                            }

                            const new_curriculum = structuredClone(editedCurriculum)
                            new_curriculum.YearLevels.push({
                                IsActive: true,
                                Name: YEAR_LEVEL_NAMES[new_curriculum.YearLevels.length],
                                Semesters: []
                            })

                            setEditedCurriculum(new_curriculum)
                        }}
                    >
                        Add Year
                    </Button>

                    <Button
                        variant='contained'
                        color="error"
                        endIcon={<RemoveIcon />}
                        fullWidth
                        size='small'
                        onClick={() => {
                            if (editedCurriculum.YearLevels.length === 0) {
                                setPopupOptions({
                                    Heading: "Year Limit Reach",
                                    HeadingStyle: { background: "yellow", color: "black" },
                                    Message: 'you can not remove more year level to this curriculum',
                                });
                                return
                            }

                            const new_curriculum = structuredClone(editedCurriculum)
                            new_curriculum.YearLevels.pop()
                            setEditedCurriculum(new_curriculum)
                        }}
                    >
                        Reduce Year
                    </Button>
                </> : null}
            </Box>
        </Box>

        {/* modify subject dialog */}
        <Dialog
            open={isDialogFormOpen}
            onClose={() => setIsDialogFormOpen(false)}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: async (event) => {
                        try {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries(formData.entries());
                            console.log('subject edit form json submit data:')
                            console.log(formJson)

                            subject.LabHours = formJson.LabHours
                            subject.LecHours = formJson.LecHours

                            setEditedCurriculum(structuredClone(editedCurriculum))

                        } catch (err) {
                            setPopupOptions({
                                Heading: "Operation Failed",
                                HeadingStyle: { background: "red", color: "white" },
                                Message: `${err.message}`,
                            });
                        } finally {
                            setIsLoading(false);
                            setIsDialogFormOpen(false);
                        }
                    },
                },
            }}
        >
            <DialogTitle>{`Modifying ${subject?.Code}`}</DialogTitle>
            <DialogContent>
                <DialogContentText minWidth={'25em'}>
                    {subject?.Name}
                </DialogContentText>
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
                    slotProps={{ htmlInput: { min: 0, max: 15 } }}
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
                    slotProps={{ htmlInput: { min: 0, max: 15 } }}
                />
            </DialogContent>
            <DialogActions>
                <Button type="submit">Save Subject</Button>
                <Button onClick={() => {
                    setIsDialogFormOpen(false)
                }}>Cancel</Button>
            </DialogActions>
        </Dialog>
    </>) : null;
}

export default CurriculumView;