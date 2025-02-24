import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import Button from '@mui/material/Button';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearAllIcon from '@mui/icons-material/ClearAll';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Loading, Popup } from "../components/Loading";

import "../assets/main.css";
import "./TimeTable.css";
import "./TimeTableDropdowns.css";
import "./instructors.css";

import { fetchAllDepartments, fetchDepartmentInstructorsDefaults, fetchDepartmentInstructorsAllocated, postUpdateInsturctor } from "../js/schedule"
import { generateTimeSlotRowLabels } from "../js/week-time-table-grid-functions";
import { InstructorTimeSlotBitMap } from "../js/instructor-time-slot-bit-map"
import { ContextMenu, ContextMenuItem, Position, useContextMenuState } from "../components/ContextMenu";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

function TimeTable() {

  /////////////////////////////////////////////////////////////////////////////////
  //                     LOAD GUARD COMPONENT STATES
  /////////////////////////////////////////////////////////////////////////////////

  const [IsLoading, setIsLoading] = useState(false);
  const [popupOptions, setPopupOptions] = useState(null);

  /////////////////////////////////////////////////////////////////////////////////
  //                       TIME TABLE GRID STATES
  /////////////////////////////////////////////////////////////////////////////////

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [startHour, setStartHour] = useState(7);
  const [timeSlotMinuteInterval, setTimeSlotMinuteInterval] = useState(30);
  const [dailyTimeSlots, setDailyTimeSlots] = useState(24);

  /////////////////////////////////////////////////////////////////////////////////
  //                       STATES FOR FETCHED DATA
  /////////////////////////////////////////////////////////////////////////////////

  const [allDepartment, setAllDepartment] = useState([]); // fetch on page load
  const [instructorsDefaults, setInstructorsDefaults] = useState([]); // fetch on page load
  const [instructorsAllocated, setInstructorsAllocated] = useState([]); // fetch on page load

  /////////////////////////////////////////////////////////////////////////////////
  //                       DROPDOWN SELECTION STATES
  /////////////////////////////////////////////////////////////////////////////////

  const [departmentID, setDepartmentID] = useState("");
  const [semesterIndex, setSemesterIndex] = useState("");

  /////////////////////////////////////////////////////////////////////////////////
  //                       SELECTED INSTRUCTORS
  /////////////////////////////////////////////////////////////////////////////////

  const [selectedInstructorDefaultIndex, setSelectedInstructorDefaultIndex] = useState("")
  const [selectedInstructorDefault, setSelectedInstructorDefault] = useState("")
  const [selectedInstructorAllocated, setSelectedInstructorAllocated] = useState("")

  /////////////////////////////////////////////////////////////////////////////////
  //                       SELECTED TIME SLOT CELL
  /////////////////////////////////////////////////////////////////////////////////

  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set())
  const [isDragSelect, setIsDragSelect] = useState()

  /////////////////////////////////////////////////////////////////////////////////
  //                       PAGE LOAD PROCESS
  /////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {

    // TODO: fetch basic const values (data below is just temporary);

    const starting_hour = 7;
    const time_slot_per_hour = 2;
    const daily_time_slots = 24;

    const time_slot_minute_interval = 60 / time_slot_per_hour;

    setStartHour(starting_hour);
    setTimeSlotMinuteInterval(time_slot_minute_interval);
    setDailyTimeSlots(daily_time_slots);

    useEffectAsyncs();
  }, []);

  async function useEffectAsyncs() {
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
  }

  /////////////////////////////////////////////////////////////////////////////////
  //                       DROPDOWN HANDLERS
  /////////////////////////////////////////////////////////////////////////////////

  const handleDepartmentChange = async (event) => {
    console.log(`selected departmentID: ${event.target.value}`);
    setDepartmentID(event.target.value);
    setSemesterIndex("");

    setInstructorsDefaults([])
    setInstructorsAllocated([])

    setSelectedInstructorDefaultIndex("")
    setSelectedInstructorDefault("")
    setSelectedInstructorAllocated("")

    setSelectedTimeSlots(new Set([]))
  }

  const handleSemesterChange = async (event) => {
    console.log(`selected semesterIndex: ${event.target.value}`);
    setSemesterIndex(event.target.value);

    setInstructorsDefaults([])
    setInstructorsAllocated([])

    setSelectedInstructorDefaultIndex("")
    setSelectedInstructorDefault("")
    setSelectedInstructorAllocated("")

    setSelectedTimeSlots(new Set([]))

    try {
      setIsLoading(true);

      const instructors_defaults = await fetchDepartmentInstructorsDefaults(departmentID, event.target.value);
      const instructors_allocated = await fetchDepartmentInstructorsAllocated(departmentID, event.target.value);

      for (let i = 0; i < instructors_defaults.length; i++) {
        instructors_defaults[i].Time = new InstructorTimeSlotBitMap(instructors_defaults[i].Time);
      }

      for (let i = 0; i < instructors_allocated.length; i++) {
        instructors_allocated[i].Time = new InstructorTimeSlotBitMap(instructors_allocated[i].Time);
      }

      setInstructorsDefaults(instructors_defaults)
      console.log('instructors_defaults :')
      console.log(instructors_defaults);
      console.log()

      setInstructorsAllocated(instructors_allocated)
      console.log('instructors_allocated :')
      console.log(instructors_allocated);
      console.log()

      setIsLoading(false);
    } catch (err) {
      setPopupOptions({
        Heading: "Failed to fetch instructor encoding resources",
        HeadingStyle: { background: "red", color: "white" },
        Message: `${err}`
      });
      setIsLoading(false);
      setSemesterIndex("");
    }
  };

  const handleInstructorSelection = (defaults_idx) => {
    setSelectedTimeSlots(new Set([]))

    let allocated_idx = -1

    for (let i = 0; i < instructorsAllocated.length; i++) {
      if (instructorsDefaults[defaults_idx].InstructorID === instructorsAllocated[i].InstructorID) {
        allocated_idx = i
        break
      }
    }

    if (allocated_idx < 0) {
      setPopupOptions({
        Heading: "Incorrect Data",
        HeadingStyle: { background: "red", color: "white" },
        Message: "missing default instructor encoding resources"
      });
    } else {
      setSelectedInstructorDefaultIndex(defaults_idx)
      setSelectedInstructorDefault(instructorsDefaults[defaults_idx])
      setSelectedInstructorAllocated(instructorsAllocated[allocated_idx])

      console.log('selected instructor defaults index :', defaults_idx)

      console.log('instructorsDefaults[defaults_idx] :')
      console.log(instructorsDefaults[defaults_idx])

      console.log('instructorsAllocated[allocated_idx] :')
      console.log(instructorsAllocated[allocated_idx])
    }
  }

  /////////////////////////////////////////////////////////////////////////////////
  //                     TIME SLOT SELECTION BUTTON HANDLERS
  /////////////////////////////////////////////////////////////////////////////////

  const handleApplyTimeSlotDefaultChanges = async () => {
    try {

      let new_default_time = []

      for (let i = 0; i < selectedInstructorDefault.Time.bitset.length; i++) {
        new_default_time.push(`${selectedInstructorDefault.Time.bitset[i]}`)
      }

      const updated_instructor_time_str = {
        InstructorID: selectedInstructorDefault.InstructorID,
        DepartmentID: selectedInstructorDefault.DepartmentID,
        FirstName: selectedInstructorDefault.FirstName,
        MiddleInitial: selectedInstructorDefault.MiddleInitial,
        LastName: selectedInstructorDefault.LastName,
        Time: new_default_time,
      }

      setIsLoading(true);

      await postUpdateInsturctor(updated_instructor_time_str);

      setPopupOptions({
        Heading: "Edits Applied Successfully",
        HeadingStyle: { background: "green", color: "white" },
        Message: "changes to the instructor time slots availability are saved"
      });

      setIsLoading(false);

    } catch (err) {
      setPopupOptions({
        Heading: "Instructor Update Failed",
        HeadingStyle: { background: "red", color: "white" },
        Message: `${err}`
      });
      setIsLoading(false);
    }
  }

  const handleContextMenuEnable = () => {
    console.log('before enable =', selectedInstructorDefault)

    let is_all_enabled = true
    let has_impossible_error = false
    let enabled_time_slots = 0

    for (const value of selectedTimeSlots) {
      let [day, time_slot] = value.split(":")

      day = Number(day)
      time_slot = Number(time_slot)

      const is_default_available = selectedInstructorDefault?.Time?.getAvailability(day, time_slot)
      const is_allocated_available = selectedInstructorAllocated?.Time?.getAvailability(day, time_slot)

      if (!is_default_available && !is_allocated_available) {
        enabled_time_slots++
      } else if (!is_default_available && is_allocated_available) {
        has_impossible_error = true
      } else {
        is_all_enabled = false
      }
    }

    if (has_impossible_error) {
      setPopupOptions({
        Heading: "That should not happen!",
        HeadingStyle: { background: "red", color: "white" },
        Message: "we detected an instructor default time slot that is not available yet the corresponding allocation time slot is available"
      });

      return
    } else if (enabled_time_slots === 0) {
      setPopupOptions({
        Heading: "No Action",
        HeadingStyle: { background: "orange", color: "white" },
        Message: "all selected time slots are either enabled or already occupied so no need to enable again"
      });
    } else if (!is_all_enabled) {
      setPopupOptions({
        Heading: "Partially Successful",
        HeadingStyle: { background: "orange", color: "white" },
        Message: `some selected time slots (${selectedTimeSlots.size - enabled_time_slots}/${selectedTimeSlots.size}) are already enabled and/or occupied so no need to enabled again`
      });
    } else {
      setPopupOptions({
        Heading: "Fully Successful",
        HeadingStyle: { background: "green", color: "white" },
        Message: "all selected time slots are enabled"
      });
    }

    for (const value of selectedTimeSlots) {
      let [day, time_slot] = value.split(":")

      day = Number(day)
      time_slot = Number(time_slot)

      const is_default_available = selectedInstructorDefault?.Time?.getAvailability(day, time_slot)
      const is_allocated_available = selectedInstructorAllocated?.Time?.getAvailability(day, time_slot)

      if (!is_default_available && !is_allocated_available) {
        selectedInstructorDefault.Time.setAvailability(true, day, time_slot)
        selectedInstructorAllocated.Time.setAvailability(true, day, time_slot)
      }
    }

    setSelectedInstructorAllocated(selectedInstructorAllocated)
    setSelectedInstructorDefault(selectedInstructorDefault)

    setSelectedTimeSlots(new Set())
  }

  const handleContextMenuDisable = () => {
    console.log('before disable =', selectedInstructorDefault)

    let is_all_disabled = true
    let has_impossible_error = false
    let disabled_time_slots = 0

    for (const value of selectedTimeSlots) {
      let [day, time_slot] = value.split(":")

      day = Number(day)
      time_slot = Number(time_slot)

      const is_default_available = selectedInstructorDefault?.Time?.getAvailability(day, time_slot)
      const is_allocated_available = selectedInstructorAllocated?.Time?.getAvailability(day, time_slot)

      if (is_default_available && is_allocated_available) {
        disabled_time_slots++
      } else if (!is_default_available && is_allocated_available) {
        has_impossible_error = true
      } else {
        is_all_disabled = false
      }
    }

    if (has_impossible_error) {
      setPopupOptions({
        Heading: "That should not happen!",
        HeadingStyle: { background: "red", color: "white" },
        Message: "we detected an instructor default time slot that is not available yet the corresponding allocation time slot is available"
      });

      return
    } else if (disabled_time_slots === 0) {
      setPopupOptions({
        Heading: "No Action",
        HeadingStyle: { background: "orange", color: "white" },
        Message: "all selected time slots are either disabled or already occupied so no need to disable again"
      });
    } else if (!is_all_disabled) {
      setPopupOptions({
        Heading: "Partially Successful",
        HeadingStyle: { background: "orange", color: "white" },
        Message: `some selected time slots (${selectedTimeSlots.size - disabled_time_slots}/${selectedTimeSlots.size}) are already disabled or occupied so no need to disable again`
      });
    } else {
      setPopupOptions({
        Heading: "Fully Successful",
        HeadingStyle: { background: "green", color: "white" },
        Message: "all selected time slots are disabled"
      });
    }

    for (const value of selectedTimeSlots) {
      let [day, time_slot] = value.split(":")

      day = Number(day)
      time_slot = Number(time_slot)

      const is_default_available = selectedInstructorDefault?.Time?.getAvailability(day, time_slot)
      const is_allocated_available = selectedInstructorAllocated?.Time?.getAvailability(day, time_slot)

      if (is_default_available && is_allocated_available) {
        selectedInstructorDefault.Time.setAvailability(false, day, time_slot)
        selectedInstructorAllocated.Time.setAvailability(false, day, time_slot)
      }
    }

    setSelectedInstructorAllocated(selectedInstructorAllocated)
    setSelectedInstructorDefault(selectedInstructorDefault)

    setSelectedTimeSlots(new Set())
  }

  /////////////////////////////////////////////////////////////////////////////////
  //                              COMPONENT UI CODE
  /////////////////////////////////////////////////////////////////////////////////

  const contextMenuState = useContextMenuState()

  return (
    <>
      <ContextMenu
        closeAfterClick={true}
        conextMenuState={contextMenuState}
      >
        <ContextMenuItem onClick={handleContextMenuEnable}>Enable</ContextMenuItem>
        <ContextMenuItem onClick={handleContextMenuDisable}>Disable</ContextMenuItem>
      </ContextMenu>

      {/*================================= Loading Component =================================*/}

      <Popup popupOptions={popupOptions} closeButtonActionHandler={() => {
        setPopupOptions(null);
      }} />

      <Loading
        IsLoading={IsLoading}
      />

      <div className="table-container">

        {/*================================= Dropdown Container =================================*/}

        <div className="dropdown-container">
          <div id="left-dropdown-container">
            <FormControl sx={{ minWidth: 130 }} size="small">
              <InputLabel id="label-id-department">Department</InputLabel>
              <Select autoWidth
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
                disabled={!departmentID}
              >
                <MenuItem value={0}>1st Semester</MenuItem>
                <MenuItem value={1}>2nd Semester</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="instructor-list-container">
          <div className="instructor-list">
            <h2>General Instructors</h2>
            <div className="instructor-list-items">
              {instructorsDefaults?.map((instructor, index) => {
                if (instructor.DepartmentID === 0) {
                  return <div
                    key={index}
                    className={`instructor-item ${selectedInstructorDefaultIndex === index ? "selected" : ""}`}
                    onClick={() => handleInstructorSelection(index)}
                  >
                    <div className="instructor-ids">{`${instructor.InstructorID}`}</div>
                    <div className="instructor-names">{`${instructor.LastName}, ${instructor.FirstName} ${instructor.MiddleInitial}.`}</div>
                  </div>
                } else {
                  return null
                }
              })}
            </div>
          </div>

          <div className="instructor-list">
            <h2>Department Instructors</h2>
            <div className="instructor-list-items">
              {instructorsDefaults?.map((instructor, index) => {
                if (instructor.DepartmentID === Number(departmentID)) {
                  return <div
                    key={index}
                    className={`instructor-item ${selectedInstructorDefaultIndex === index ? "selected" : ""}`}
                    onClick={() => handleInstructorSelection(index)}
                  >
                    <div className="instructor-ids">{`${instructor.InstructorID}`}</div>
                    <div className="instructor-names">{`${instructor.LastName}, ${instructor.FirstName} ${instructor.MiddleInitial}.`}</div>
                  </div>
                } else {
                  return null
                }
              })}
            </div>
          </div>

        </div>

        {/*================================= TimeTable Table =================================*/}

        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: "1em" }}>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "0.6em" }}>
            <p>time slot drag select </p>
            {isDragSelect ?
              <div style={{ width: "0.8em", height: "0.8em", background: "green" }}></div> :
              <div style={{ width: "0.8em", height: "0.8em", background: "red" }}></div>
            }
          </div>
          <div style={{ display: "flex", gap: "0.8em" }}>

            <Button
              startIcon={<ClearAllIcon />} size="medium" color="primary" variant="contained"
              onClick={() => setSelectedTimeSlots(new Set([]))}
            >Clear Time Slot Selection</Button>

            <Button
              endIcon={<DoneIcon />} size="medium" color="success" variant="contained"
              onClick={handleApplyTimeSlotDefaultChanges} loading={IsLoading}
            >Apply Changes</Button>

            <Button
              endIcon={<CancelIcon />} size="medium" color="error" variant="outlined"
            >Cancel</Button>

          </div>
        </div>

        <table className="time-table">
          <thead>
            <tr>
              <th className="time-slot-header">Time Slot</th>
              {DAYS.map((day) => (
                <th key={day} className="day-header">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {generateTimeSlotRowLabels(startHour, timeSlotMinuteInterval, dailyTimeSlots).map((time_slot_label, time_slot_index) => (
              <tr key={time_slot_index}>
                <td className="time-slot">{time_slot_label}</td>
                {DAYS.map((_, day_index) => {
                  let class_name = ""
                  let selected = ""

                  const is_available_default = selectedInstructorDefault?.Time?.getAvailability(day_index, time_slot_index) ? true : false
                  const is_available_alloc = selectedInstructorAllocated?.Time?.getAvailability(day_index, time_slot_index) ? true : false

                  if (!is_available_default) {
                    class_name = "disabled-slot"
                  } else if (is_available_default && !is_available_alloc) {
                    class_name = "occupied-slot"
                  } else {
                    class_name = "available-slot"
                  }

                  if (selectedTimeSlots?.has(`${day_index}:${time_slot_index}`)) {
                    selected = "selected-time-slot-cell"
                  }

                  return (
                    <td
                      key={day_index}
                      className={class_name}

                      onContextMenu={(event) => {
                        event.preventDefault()
                        console.log(`right click: class="${event.target.className}"`)

                        const available = selectedInstructorAllocated?.Time?.getAvailability(day_index, time_slot_index)
                        console.log(`day(${day_index}), time_slot(${time_slot_index} = available? ${available})`)

                        contextMenuState.setShow(true)
                        contextMenuState.setPosition(new Position(event.clientX, event.clientY))

                        const is_selected = selectedTimeSlots.has(`${day_index}${time_slot_index}`)

                        if (!is_selected) {
                          const new_selected_time_slots = new Set(selectedTimeSlots)
                          new_selected_time_slots.add(`${day_index}:${time_slot_index}`)
                          setSelectedTimeSlots(new_selected_time_slots)
                          console.log(new_selected_time_slots)
                        }
                      }}

                      onMouseDown={(event) => {
                        console.log(`drag start: class="${event.target.className}"`)
                        setIsDragSelect(true)

                        const is_selected = selectedTimeSlots.has(`${day_index}${time_slot_index}`)

                        if (!is_selected) {
                          const new_selected_time_slots = new Set(selectedTimeSlots)
                          new_selected_time_slots.add(`${day_index}:${time_slot_index}`)
                          setSelectedTimeSlots(new_selected_time_slots)
                          console.log(new_selected_time_slots)
                        }
                      }}

                      onMouseEnter={(event) => {
                        console.log(`dragging: class="${event.target.className}"`)

                        const is_selected = selectedTimeSlots.has(`${day_index}${time_slot_index}`)

                        if (!is_selected && isDragSelect) {
                          const new_selected_time_slots = new Set(selectedTimeSlots)
                          new_selected_time_slots.add(`${day_index}:${time_slot_index}`)
                          setSelectedTimeSlots(new_selected_time_slots)
                          console.log(new_selected_time_slots)
                        }
                      }}

                      onMouseUp={(event) => {
                        console.log(`drag end: class="${event.target.className}"`)
                        setIsDragSelect(false)
                      }}
                    >
                      <span className={`time-slot-cover ${selected}`}></span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TimeTable />
  </StrictMode>
);
