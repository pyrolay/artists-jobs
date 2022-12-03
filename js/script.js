// Selector functions
const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

// Global Helper Functions
const hideElement = (document) => {
    $(`${document}`).classList.remove("show")
    $(`${document}`).classList.add("hide")
}

const showElement = (document) => {
    $(`${document}`).classList.remove("hide")
    $(`${document}`).classList.add("show")
}

const showSpinner = (document) => {
    $(document).innerHTML = `
        <div class="loader">
            <div class="loader-inner">
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
                <div class="loader-line-wrap">
                    <div class="loader-line"></div>
                </div>
            </div>
        </div>
    `
}

const capitalizeString = (string) => {
    const result = string.charAt(0).toUpperCase() + string.slice(1)
    return result
}

// Async functions

const getJobs = async (jobId = "") => {
    const res = await fetch(`https://637ebce4cfdbfd9a63b65e2f.mockapi.io/jobs/${jobId}`)
    const jobs = await res.json()
    return jobs
}

const addJob = () => {
    fetch('https://637ebce4cfdbfd9a63b65e2f.mockapi.io/jobs', {
        method: 'POST', 
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify(saveJob())
    }).finally(() => {
        hideElement(".job-form")
        showElement(".main-section")
        callDataForCards()
    })
}

// Functions

const getTodaysDate = () => {
    const newDate = new Date()
    const today = [newDate.getMonth() + 1, newDate.getDate(), newDate.getFullYear()]
    return today.join("-")
}

const formatDate = (date) => {
    date = new Date(date)
    const getDate = [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    return getDate.join("/")
}

const getLocationsOfJobs = (jobs) => {
    const locations = []
    for (const { location } of jobs) {
        if (!locations.includes(location)) locations.push(location)
    }
    return locations
}

const callDataForCards = () => {
    $(".jobs-found").innerHTML = '0 jobs'
    showSpinner(".card-container")
    getJobs().then(data => {
        setTimeout(() => {
            setLocationsInSelect(getLocationsOfJobs(data))
            generateCards(data)
        }, 2000);
    })
}

const saveJob = () => {
    return {
        company: capitalizeString($("#company-name").value),
        name: capitalizeString($("#job-name").value),
        description: capitalizeString($("#job-description").value),
        location: capitalizeString($("#job-location").value),
        category: $("#job-category").value,
        experience: $("#experience-radio").checked,
        salary: $("#job-salary").value,
        posted: getTodaysDate(),
        remote: $("#remote-radio").checked,
        type: $("#job-type").value,
    }
}

// Navigation functions

const showDropdown = () => {
    $(".dropdown-menu").classList.toggle("show")
}

const setBtnReturn = () => {
    $(".btn-return").addEventListener("click", () => {
        $("html").style = "scroll-behavior: smooth"
        hideElement("#jobData")
        showElement(".main-section")
        callDataForCards()
    })
}

const closingForm = () => {
    hideElement(".job-data")
    hideElement(".job-form")
    showElement(".main-section")
    callDataForCards()
}

// DOM

const setLocationsInSelect = (locations) => {
    $("#search-location").innerHTML = '<option value="All">All Locations</option>'
    for (const location of locations) {
        $("#search-location").innerHTML += 
        `<option value="${location}">${location}</option>`
    }
}

const generateCards = (jobs) => {
    $(".card-container").innerHTML = ""
    $(".jobs-found").innerHTML = `${jobs.length} jobs`
    for (const job of jobs) {
        const { category, company, experience, id, location, name, type, posted, remote } = job
        $(".card-container").innerHTML += `
            <div class="card">
                <div class="job-title">
                    <h2>${name}</h2>
                    <a href="#jobData" class="btn-see-job" id="${id}">
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
                <p class="company-name">${company}</p>
                <p class="job-type">${location}</p>
                <div class="tags">
                    <span class="tag">${type}</span>
                    ${experience ? '<span class="tag">Experienced</span>' : ""}
                    ${remote ? '<span class="tag">Remote</span>' : ""}
                    <span class="tag">${category}</span>
                </div>
                <p class="date">posted ${formatDate(posted)}</p>
            </div>
        `
    }

    const btnSeeJob = $$(".btn-see-job")

    for (const btn of btnSeeJob) {
        btn.addEventListener("click", () => {
            const jobId = btn.id
            $("html").style = "scroll-behavior: unset"
            hideElement(".main-section")
            btnReturnFunctions()
            showElement("#jobData")
            showSpinner(".job-info")
            setTimeout(() => {
                getJobs(jobId).then(data => generateJob(data))
            }, 2000);
        })
    }
}

const btnReturnFunctions = () => {
    $(".btn-job").innerHTML = `
        <a href="#jobs-section" class="btn-return">
            <i class="fa-solid fa-arrow-left"></i>
        </a>
        <div class="dropdown notVisible">
            <i class="menu-icon btn-right fa-solid fa-ellipsis-vertical"></i>
            <div id="dropdown-menu" class="dropdown-menu">
                <a id="editJob">Edit</a>
                <a id="deleteJob">Delete</a>
            </div>
        </div>
    `
    setBtnReturn()
}

const generateJob = (jobId) => {
    const { company, name, description, location, experience, salary, posted, remote, type, id } = jobId

    $(".dropdown").classList.remove("notVisible")
    $("#editJob").setAttribute("data-id", id)
    $("#deleteJob").setAttribute("data-id", id)

    $(".job-info").innerHTML = `
        <div class="job-title">
            <h2>${name}</h2>
            <p>${company}</p>
            <p>${location} <span>📌</span></p>
            <p class="date">posted ${posted}</p>
        </div>
        <div class="job-description">
            <p>${salary}</p>
            <div class="employment">
                <p>
                    <span class="employment-data">Type:</span> <span>${type}</span>
                </p>
                <p>
                    <span class="employment-data">Remote:</span> <span>${remote ? "Yes" : "No"}</span>
                </p>
                <p>
                    <span class="employment-data">Experience:</span> <span>${experience ? "Needed" : "No needed"}</span>
                </p>
            </div>
            <p>${description}</p>
        </div>
    `

    $(".menu-icon").addEventListener("click", () => showDropdown())

    $("#deleteJob").addEventListener("click", () => {
        deleteJobDOM()
    })
    
    $("#editJob").addEventListener("click", () => {
        hideElement(".main-section")
        hideElement(".job-data")
        showElement(".job-form")
    })
}

const deleteJobDOM = () => {
    $(".job-info").innerHTML = ` 
        <div class="delete-container">
            <p>Are you sure you want to delete the <span>"Architect"</span> job?</p>
            <div class="delete-btns">
                <button class="delete-btn btn">Delete</button>
                <button class="cancel-btn btn">Cancel</button>
            </div>
        </div>
    `
}

// Navigation events

$("#form").addEventListener("submit", (e) => {
    e.preventDefault()
    addJob()
})

$("#openNewJobForm").addEventListener("click", (e) => {
    e.preventDefault()
    hideElement(".main-section")
    hideElement(".job-data")
    showElement(".job-form")
})

$(".exit-form").addEventListener("click", () => closingForm())

$(".cancelFormBtn").addEventListener("click", (e) => closingForm())

// Window events

window.addEventListener("click", (e) => {
    if (!e.target.matches('.menu-icon')) {
        const menus = $$(".dropdown-menu")
        for (const menu of menus) {
            if (menu.classList.contains('show')) menu.classList.remove('show')
        }
    }
})

window.addEventListener("load", () => {
    callDataForCards()
    btnReturnFunctions()
})