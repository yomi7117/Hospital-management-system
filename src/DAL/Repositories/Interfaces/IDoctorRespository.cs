using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Repositories.Interfaces
{
 public   interface IDoctorRespository: IRepository<Doctor>
    {
        IEnumerable<Doctor> GetTopActiveDoctors(int count);
        IEnumerable<Doctor> GetAllDoctorsData();
        Doctor GetDoctorByIdAsync(int doctorId);
        Doctor GetDoctorByNameAsync(string doctorName);
        Tuple<bool> CreateDoctorsAsync(Doctor doctor);
        Tuple<bool> DeleteDoctorsAsync(int id);
        Tuple<bool> DeleteDoctorsAsync(Doctor doctor);
    }
}
