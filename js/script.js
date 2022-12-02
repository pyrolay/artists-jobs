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

// Async functions

const getJobs = async (jobId = "") => {
    const res = await fetch(`https://637ebce4cfdbfd9a63b65e2f.mockapi.io/jobs/${jobId}`)
    const jobs = await res.json()
    return jobs
}

// Functions

const callDataForCards = () => {
    showSpinner(".card-container")
    getJobs().then(data => {
        setTimeout(() => {
            generateCards(data)
        }, 2000);
    })
}

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

// DOM

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
                <p class="date">posted ${posted}</p>
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

$("#openNewJobForm").addEventListener("click", (e) => {
    e.preventDefault()
    hideElement(".main-section")
    hideElement(".job-data")
    showElement(".job-form")
})

$(".exit-form").addEventListener("click", (e) => {
    e.preventDefault()
    hideElement(".job-data")
    hideElement(".job-form")
    showElement(".main-section")
})

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