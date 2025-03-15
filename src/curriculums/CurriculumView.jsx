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
    Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { loadCurriculum, postCreateCurriculum, patchUpdateCurriculum } from '../js/curriculums';
import { Popup } from '../components/Loading';

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
};

function CurriculumView({ mode, curriculum_id, department, setPopupOptions, onClose }) {
    const [isLoading, setIsLoading] = useState(false)
    const [curriculum, setCurriculum] = useState(null)

    useEffect(() => {
        const useEffectAsyncs = async () => {
            try {
                setIsLoading(true);
                const loaded_curriculum = await loadCurriculum(curriculum_id);
                setCurriculum(loaded_curriculum);
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

    return !isLoading ? (<Box>
        <Box display={'flex'} justifyContent={'space-between'} borderBottom={'gray solid thin'} padding={'0.5em'}>
            <Typography variant='h6'>{curriculum?.CurriculumCode}</Typography>
            <Box display={'flex'} gap={'0.5em'}>
                <Button
                    endIcon={<EditIcon />} size="small" color="primary" variant="contained"
                >
                    Edit
                </Button>
                <Button
                    endIcon={<CancelIcon />} size="small" color="error" variant="outlined"
                    onClick={() => onClose()}
                >
                    Close
                </Button>
            </Box>
        </Box>

        <Box display={'flex'} alignItems={'baseline'} justifyContent={'space-between'} borderBottom={'black solid thick'} padding={'0.5em'}>
            <Typography variant='h6'>{curriculum?.CurriculumName}</Typography>
            <Typography variant='body1' fontStyle={'italic'}>{`${department?.Name}`}</Typography>
        </Box>

        <Box>
            {curriculum?.YearLevels.map((year_level, index_curriculum) => (<Accordion key={`accordion-id-curriculum-${index_curriculum}`}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`yrlvl-panel${index_curriculum + 1}-content`}
                    id={`yrlvl-panel${index_curriculum + 1}-header`}
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
                        <Typography variant='body1' component="span">{year_level?.IsActive ? '(Active)' : '(Inactive)'}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ minHeight: '0px', padding: '0.2em 1em 0.5em 1em' }}>
                    {year_level?.Semesters.map((semester, index_semester) => (<Accordion key={`accordion-id-year-level-${index_semester}`}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`sem-panel${index_semester + 1}-content`}
                            id={`sem-panel${index_semester + 1}-header`}
                            sx={{
                                minHeight: '0px',
                                '&.Mui-expanded': {
                                    minHeight: '0px',
                                    backgroundColor: 'darkgray',
                                    color: 'white'
                                },
                                padding: '0xp',
                                height: '2em',
                                ":hover": { backgroundColor: 'ButtonHighlight' },
                            }}
                        >
                            <Typography variant='body2' component="span">{semester?.Name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ minHeight: '0px', padding: '0.3em', display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
                            <Box width={'100%'} display={'flex'} justifyContent={'right'} paddingBlockEnd={'0px'}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    endIcon={<AddIcon />}
                                >
                                    Add Subject
                                </Button>
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
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {semester?.Subjects.map((subject, index_subject) => (
                                            <TableRow key={subject.ID}>
                                                <TableCell>{subject.ID}</TableCell>
                                                <TableCell>{subject.Code}</TableCell>
                                                <TableCell>{truncateText(subject.Name, 50)}</TableCell>
                                                <TableCell>{subject.LecHours}</TableCell>
                                                <TableCell>{subject.LabHours}</TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        style={{ marginRight: 8 }}
                                                        startIcon={<EditIcon />}
                                                    // onClick={() => {
                                                    //     setSubject(subject);
                                                    //     setMode("edit");
                                                    //     setIsDialogFormOpen(true);
                                                    // }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        endIcon={<RemoveCircleOutlineIcon />}
                                                        onClick={() => {
                                                            setIsLoading(true)
                                                            semester?.Subjects.splice(index_subject, 1)
                                                            setCurriculum(structuredClone(curriculum))
                                                            setIsLoading(false)
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>))}
                </AccordionDetails>
            </Accordion>))}
        </Box>
    </Box>) : null;
}

export default CurriculumView;