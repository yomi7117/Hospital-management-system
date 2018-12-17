
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DAL;
using QuickApp.ViewModels;
using AutoMapper;
using DAL.Models;
using Microsoft.Extensions.Logging;
using QuickApp.Helpers;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization;

namespace QuickApp.Controllers
{
    [Route("api/[controller]")]
    public class CustomerController : Controller
    {
        private IUnitOfWork _unitOfWork;
        readonly ILogger _logger;
        readonly IEmailSender _emailer;


        public CustomerController(IUnitOfWork unitOfWork, ILogger<CustomerController> logger, IEmailSender emailer)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _emailer = emailer;
        }



        // GET: api/values
        [HttpGet("get")]
        public IActionResult Get()
        {
            var allCustomers = _unitOfWork.Customers.GetAllCustomersData();
            return Ok(Mapper.Map<IEnumerable<CustomerViewModel>>(allCustomers));
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
        public IActionResult Post([FromBody] CustomerViewModel customer)
        {
            if (ModelState.IsValid)
            {
                if (customer == null)
                    return BadRequest($"{nameof(customer)} cannot be null");


                Customer appCustomer = Mapper.Map<Customer>(customer);

                //Mapper.Map<CustomerViewModel, Customer>(customer, appCustomer);
                //var user = user.identity.getuserid();

                var result = _unitOfWork.Customers.CreateCustomerAsync(appCustomer);
                if (result.Item1)
                    return NoContent();
            }

            return BadRequest(ModelState);
        }




        //[HttpPost("customers")]
        //[Authorize(Authorization.Policies.ManageAllRolesPolicy)]
        //[ProducesResponseType(201, Type = typeof(CustomerViewModel))]
        //[ProducesResponseType(400)]
        //public IActionResult CreateCustomer([FromBody] CustomerViewModel customer)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        if (customer == null)
        //            return BadRequest($"{nameof(customer)} cannot be null");


        //        Customer appCustomer = Mapper.Map<Customer>(customer);

        //        //Mapper.Map<CustomerViewModel, Customer>(customer, appCustomer);

        //        var result = _unitOfWork.Customers.CreateCustomerAsync(appCustomer);
        //        if (result.Item1)
        //            return NoContent();
        //    }

        //    return BadRequest(ModelState);
        //}



        [HttpPut("update/{id}")]
        //[Authorize(Authorization.Policies.ManageAllRolesPolicy)]
        //[ProducesResponseType(204)]
        //[ProducesResponseType(400)]
        //[ProducesResponseType(404)]
        public IActionResult UpdateCustomer(int id, [FromBody] CustomerViewModel customer)
        {
            if (ModelState.IsValid)
            {
                if (customer == null)
                    return BadRequest($"{nameof(customer)} cannot be null");

                if ( id != customer.Id)
                    return BadRequest("Conflicting customer id in parameter and model data");



                Customer appCustomer = _unitOfWork.Customers.GetCustomerByIdAsync(id);


                if (appCustomer == null)
                    return NotFound(id);


                Mapper.Map<CustomerViewModel, Customer>(customer, appCustomer);

                var result = _unitOfWork.Customers.CreateCustomerAsync(appCustomer);

                if (result.Item1)
                    return NoContent();
            }

            return BadRequest(ModelState);
        }



        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }



        //// DELETE api/values/5
        //[HttpDelete("delete/{id}")]
        //public void Delete(int id)
        //{
        //}



        [HttpDelete("delete/{id}")]
        public IActionResult DeleteCustomer(int id)
        {

            //if (!await _accountManager.TestCanDeleteUserAsync(id))
            //    return BadRequest("User cannot be deleted. Delete all orders associated with this user and try again");


            Customer appCustomer = _unitOfWork.Customers.GetCustomerByIdAsync(id);

            if (appCustomer == null)
                return NotFound(id);

            var result = _unitOfWork.Customers.DeleteCustomerAsync(appCustomer);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst deleting customer: " + string.Join(", ", result.Item1));


            return Ok(appCustomer);
        }
    }
}
