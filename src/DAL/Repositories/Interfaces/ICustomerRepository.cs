// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DAL.Repositories.Interfaces
{
    public interface ICustomerRepository : IRepository<Customer>
    {
        IEnumerable<Customer> GetTopActiveCustomers(int count);
        IEnumerable<Customer> GetAllCustomersData();
        Customer GetCustomerByIdAsync(int customerId);
        Customer GetCustomerByNameAsync(string customerName);
        Tuple<bool> CreateCustomerAsync(Customer customer);
        Tuple<bool> DeleteCustomerAsync(int id);
        Tuple<bool> DeleteCustomerAsync(Customer customer);
    }
}
