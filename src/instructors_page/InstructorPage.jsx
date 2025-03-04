import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Loading, Popup } from "../components/Loading";

import "../assets/main.css";
import "./TimeTable.css";
import "./TimeTableDropdowns.css";
import "./instructors.css";

import { fetchAllDepartments, postUpdateInsturctor } from "../js/schedule"
import { Box, FormControl, InputLabel, MenuItem, Select, ThemeProvider, Button, Typography, createTheme } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

import { InstructorTimeSlotBitMap } from "../js/instructor-time-slot-bit-map"


import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import someTheme from "../components/Theme";

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, CircularProgress } from "@mui/material";
import { List, ListItem, ListItemText, Stack } from "@mui/material";
import { Padding } from "@mui/icons-material";

import InstructorTableList from "./InstructorsTableList";
import InstructorTimeSlot from "./InstructorTimeSlot"

// just use the default theme for now
const theme = createTheme();
// const theme = someTheme;

function TimeTable() {

    const [isView, setIsView] = useState(false)
    const [mode, setMode] = useState("")

    /////////////////////////////////////////////////////////////////////////////////
    //                     LOAD GUARD COMPONENT STATES
    /////////////////////////////////////////////////////////////////////////////////

    const [IsLoading, setIsLoading] = useState(false);
    const [popupOptions, setPopupOptions] = useState(null);

    /////////////////////////////////////////////////////////////////////////////////
    //                       STATES FOR FETCHED DATA
    /////////////////////////////////////////////////////////////////////////////////

    const [allDepartment, setAllDepartment] = useState([]); // fetch on page load

    /////////////////////////////////////////////////////////////////////////////////
    //                       DROPDOWN SELECTION STATES
    /////////////////////////////////////////////////////////////////////////////////

    const [departmentID, setDepartmentID] = useState("");
    const [semesterIndex, setSemesterIndex] = useState("");

    /////////////////////////////////////////////////////////////////////////////////
    //                       SELECTED INSTRUCTORS
    /////////////////////////////////////////////////////////////////////////////////

    const [selectedInstructorDefault, setSelectedInstructorDefault] = useState("")
    const [selectedInstructorAllocated, setSelectedInstructorAllocated] = useState("")

    /////////////////////////////////////////////////////////////////////////////////
    //                       SELECTED TIME SLOT CELL
    /////////////////////////////////////////////////////////////////////////////////

    const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set())

    /////////////////////////////////////////////////////////////////////////////////
    //                       PAGE LOAD PROCESS
    /////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {

        // TODO: fetch basic const values (data below is just temporary);

        const starting_hour = 7;
        const time_slot_per_hour = 2;
        const daily_time_slots = 24;

        const time_slot_minute_interval = 60 / time_slot_per_hour;

        const useEffectAsyncs = async () => {
            try {
                setIsLoading(true);

                const all_departments = await fetchAllDepartments();


                setAllDepartment(all_departments);
                console.log('all_departments')
                console.log(all_departments);
                console.log()


                setIsLoading(false);
            } catch (err) {
                setPopupOptions({
                    Heading: "Failed to Fetch All Department Data",
                    HeadingStyle: { background: "red", color: "white" },
                    Message: `${err}`
                });
                setIsLoading(false);
                setSemesterIndex("");
            }
        };

        useEffectAsyncs();
    }, []);

    /////////////////////////////////////////////////////////////////////////////////
    //                       DROPDOWN HANDLERS
    /////////////////////////////////////////////////////////////////////////////////

    const handleDepartmentChange = async (event) => {
        console.log(`selected departmentID: ${event.target.value}`);
        setDepartmentID(event.target.value);
        setSemesterIndex("");

        setSelectedInstructorDefault("")
        setSelectedInstructorAllocated("")

        setSelectedTimeSlots(new Set([]))
        setIsView(false)
    }

    const handleSemesterChange = async (event) => {
        console.log(`selected semesterIndex: ${event.target.value}`);
        setSemesterIndex(event.target.value);

        setSelectedInstructorDefault("")
        setSelectedInstructorAllocated("")

        setSelectedTimeSlots(new Set([]))
        setIsView(false)
        console.log('setIsView(false)')
    };


    /////////////////////////////////////////////////////////////////////////////////
    //                              COMPONENT UI CODE
    /////////////////////////////////////////////////////////////////////////////////


    return (<>
        <Popup popupOptions={popupOptions} closeButtonActionHandler={() => {
            setPopupOptions(null);
        }} />

        <Loading
            IsLoading={IsLoading}
        />

        <Box display={!isView ? 'block' : 'none'}>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <FormControl sx={{ minWidth: 130 }} size="small">
                    <InputLabel id="label-id-department">Department</InputLabel>
                    <Select
                        id="id-department" labelId="label-id-department" label="Department"
                        value={departmentID}
                        onChange={handleDepartmentChange}
                    >
                        <MenuItem value=""><em>none</em></MenuItem>
                        {allDepartment ?
                            allDepartment.map((department, index) => (
                                <MenuItem key={index} value={department.DepartmentID}>{department.Code}</MenuItem>
                            )) : null
                        }
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 115 }} size="small">
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
                </FormControl>

                <Box style={{ width: '100%', display: 'flex', justifyContent: 'right' }}>
                    <Button disabled={!Number.isInteger(departmentID)}
                        endIcon={<AddIcon />} size="medium" color="secondary" variant="contained"
                        onClick={() => {
                            setMode("new")
                            setIsView(true)

                            const new_instructor = {
                                DepartmentID: departmentID,
                                FirstName: "",
                                LastName: "",
                                MiddleInitial: "",
                                Time: new InstructorTimeSlotBitMap(),
                            }

                            setSelectedInstructorAllocated(new_instructor)
                            setSelectedInstructorDefault(new_instructor)
                        }}
                        loading={IsLoading}
                    >
                        Add New Instructor
                    </Button>
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: '0.2em' }}>
                {Number.isInteger(semesterIndex) ?
                    <InstructorTableList
                        DepartmentID={departmentID}
                        Semester={semesterIndex}
                        SetPopUpOptions={setPopupOptions}
                        setSelectedInstructorDefault={setSelectedInstructorDefault}
                        setSelectedInstructorAllocated={setSelectedInstructorAllocated}
                        setIsView={setIsView}
                        setMode={setMode}
                    /> : <Typography sx={{ textAlign: 'center', fontStyle: 'italic', color: 'GrayText' }} >Select A Department and a Semester</Typography>}
            </Box>
        </Box >

        {
            isView ?
                <InstructorTimeSlot
                    SelectedInstructorDefault={selectedInstructorDefault}
                    SelectedInstructorAllocated={selectedInstructorAllocated}
                    setIsView={setIsView}
                    mode={mode}
                    setMode={setMode}
                /> : null
        }
    </>);
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <TimeTable />
    </StrictMode>
);
