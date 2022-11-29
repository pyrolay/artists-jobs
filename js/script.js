const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

const hideElement = (document) => {
    $(`${document}`).classList.remove("show")
    $(`${document}`).classList.add("hide")
}

const showElement = (document) => {
    $(`${document}`).classList.remove("hide")
    $(`${document}`).classList.add("show")
}

const showDropdown = () => $(".dropdown-menu").classList.toggle("show")

$(".menu-icon").addEventListener("click", () => showDropdown())

const deleteJobDOM = () => {
    $(".job-info").innerHTML = ""
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

$("#deleteJob").addEventListener("click", () => {
    deleteJobDOM()
})

$("#editJob").addEventListener("click", () => {
    hideElement(".main-section")
    hideElement(".job-data")
    showElement(".job-form")
})

for (const btn of $$(".btn-see-job")) {
    btn.addEventListener("click", () => {
        $("html").style = "scroll-behavior: unset"
        showElement(".job-data")
        hideElement(".main-section")
    })
}

$(".btn-return").addEventListener("click", () => {
    $("html").style = "scroll-behavior: smooth"
    hideElement(".job-data")
    showElement(".main-section")
})

window.addEventListener("click", (e) => {
    if (!e.target.matches('.menu-icon')) {
        const menus = $$(".dropdown-menu")
        for (const menu of menus) {
            if (menu.classList.contains('show')) menu.classList.remove('show')
        }
    }
})