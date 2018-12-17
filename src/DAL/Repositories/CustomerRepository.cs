// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DAL.Models;
using DAL.Repositories.Interfaces;
using AspNet.Security.OpenIdConnect.Primitives;
using Microsoft.AspNetCore.Http;

namespace DAL.Repositories
{
    public class CustomerRepository : Repository<Customer>, ICustomerRepository
    {
        public CustomerRepository(ApplicationDbContext context) : base(context)
        { }


        public IEnumerable<Customer> GetTopActiveCustomers(int count)
        {
            throw new NotImplementedException();
        }


        public IEnumerable<Customer> GetAllCustomersData()
        {
            return _appContext.Customers
                .Include(c => c.Orders).ThenInclude(o => o.OrderDetails).ThenInclude(d => d.Product)
                .Include(c => c.Orders).ThenInclude(o => o.Cashier)
                .OrderBy(c => c.Name)
                .ToList();
        }

        public Customer GetCustomerByIdAsync(int customerId)
        {
            //var response = _appContext.Customers.Where(x => x.Id == customerId);
            var response = _appContext.Customers.Where(x => x.Id == customerId).FirstOrDefault();

            return response;
           // return Tuple.Create(true);
        }


        public Customer GetCustomerByNameAsync(string customerName)
        {
            var response = _appContext.Customers.FindAsync(customerName);
            return null;
        }


        public Tuple<bool> CreateCustomerAsync(Customer customer)
        {
            if (customer.Id == 0)
            {
                customer.DateCreated = DateTime.Now;
                customer.DateModified = DateTime.Now;
                customer.UpdatedDate = DateTime.Now;
                customer.CreatedDate = DateTime.Now;
                //customer.CreatedBy = ApplicationUser.Identity.ToString();
                //customer.CreatedBy = HttpContext.;


                //var result = _context.AddAsync(customer);
                var result = _context.Add(customer);
                _context.SaveChanges();
            }
            else
            {
                var result = _context.Update(customer);
                _context.SaveChanges();
            }


            return Tuple.Create(true);
         
        }



        public Tuple<bool> DeleteCustomerAsync(int id)
        {
            var response = _appContext.Customers.Where(x => x.Id == id).FirstOrDefault();

            if (response != null)
            {
                var result = _context.Remove(response);
            }
               

            return Tuple.Create(true);
        }


        public Tuple<bool> DeleteCustomerAsync(Customer customer)
        {
            var result = _context.Remove(customer);
            _context.SaveChanges();
            return Tuple.Create(true);
        }

        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
    }
}
