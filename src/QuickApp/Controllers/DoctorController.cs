using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QuickApp.Helpers;
using QuickApp.ViewModels;

namespace QuickApp.Controllers
{
    [Route("api/[controller]")]
    public class DoctorController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger _logger;
        private readonly IEmailSender _emailer;

        public DoctorController(IUnitOfWork unitOfWork, ILogger<DoctorController> logger, IEmailSender emailer)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _emailer = emailer;
        }


        // GET: api/values

        [HttpGet("get")]
        public IActionResult Get()
        {
            var allDoctors = _unitOfWork.Doctors.GetAllDoctorsData();
            return Ok(Mapper.Map<IEnumerable<DoctorViewModel>>(allDoctors));
        }


        [HttpGet("throw")]
        public IEnumerable<CustomerViewModel> Throw()
        {
            throw new InvalidOperationException("This is a test exception: " + DateTime.Now);
        }
        [HttpGet("email")]
        public async Task<string> Email()
        {
            string recepientName = "QickApp Tester";
            string recepientEmail = "test@ebenmonney.com";

            string message = EmailTemplates.GetTestEmail(recepientName, DateTime.UtcNow);

            (bool success, string errorMsg) = await _emailer.SendEmailAsync(recepientName, recepientEmail, "Test Email from QuickApp", message);

            if (success)
                return "Success";

            return "Error: " + errorMsg;
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value: " + id;
        }

        // POST api/values
        [HttpPost("add")]
        public IActionResult Post([FromBody] DoctorViewModel doctor)
        {
            if (ModelState.IsValid)
            {
                if (doctor == null)
                    return BadRequest($"{nameof(doctor)} cannot be null");


                Doctor appDoctor = Mapper.Map<Doctor>(doctor);


                var result = _unitOfWork.Doctors.CreateDoctorsAsync(appDoctor);

                if (result.Item1)
                    return Ok(result);
            }

            return BadRequest(ModelState);
        }

        public IActionResult Index()
        {
            return View();
        }
        [HttpPut("update/{id}")]
        public IActionResult UpdateDoctor(int id, [FromBody] DoctorViewModel doctor)

        {
            if (ModelState.IsValid)
            {
                if (doctor == null)
                    return BadRequest($"{nameof(doctor)} cannot be null");

                if (id != doctor.Id)
                    return BadRequest("Conflicting doctor id in parameter and model data");



                Doctor appDoctor = _unitOfWork.Doctors.GetDoctorByIdAsync(id);


                if (appDoctor == null)
                    return NotFound(id);


                Mapper.Map<DoctorViewModel, Doctor>(doctor, appDoctor);

                var result = _unitOfWork.Doctors.CreateDoctorsAsync(appDoctor);

                if (result.Item1)
                    return NoContent();
            }

            return BadRequest(ModelState);
        }
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteDoctor(int id)
        {

            //if (!await _accountManager.TestCanDeleteUserAsync(id))
            //    return BadRequest("User cannot be deleted. Delete all orders associated with this user and try again");


            Doctor appDoctor = _unitOfWork.Doctors.GetDoctorByIdAsync(id);

            if (appDoctor == null)
                return NotFound(id);

            var result = _unitOfWork.Doctors.DeleteDoctorsAsync(appDoctor);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst deleting doctor: " + string.Join(", ", result.Item1));


            return Ok(appDoctor);
        }

    }
}