using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL.Repositories
{
   public class DoctorRespository: Repository<Doctor>, IDoctorRespository
    {
        public DoctorRespository(ApplicationDbContext context) : base(context)
        { }

        Tuple<bool> IDoctorRespository.CreateDoctorsAsync(Doctor doctor)
        {
            if (doctor.Id == 0)
            {
                doctor.DateCreated = DateTime.Now;
                doctor.DateModified = DateTime.Now;
                doctor.CreatedDate = DateTime.Now;
                doctor.UpdatedDate = DateTime.Now;
                doctor.UpdatedBy = _appContext.CurrentUserId;
            
            var result = _context.Add(doctor);
            _context.SaveChanges();
        }
             else
        
            {
                var result = _context.Update(doctor);
                _context.SaveChanges();
            }


            return Tuple.Create(true);

        }

        Tuple<bool> IDoctorRespository.DeleteDoctorsAsync(int id)
        {
            var response = _appContext.Doctors.Where(x => x.Id == id).FirstOrDefault();

            if (response != null)
            {
                var result = _context.Remove(response);
            }


            return Tuple.Create(true);
        }

        Tuple<bool> IDoctorRespository.DeleteDoctorsAsync(Doctor doctor)
        {
            var result = _context.Remove(doctor);
            _context.SaveChanges();
            return Tuple.Create(true);
        }

        IEnumerable<Doctor> IDoctorRespository.GetAllDoctorsData()
        {
            return _appContext.Doctors.ToList();
        }

        Doctor IDoctorRespository.GetDoctorByIdAsync(int doctorId)
        {
            var response = _appContext.Doctors.Where(d => d.Id == doctorId).FirstOrDefault();

            return response;
        }

        Doctor IDoctorRespository.GetDoctorByNameAsync(string doctorName)
        {
            var response = _appContext.Doctors.FindAsync(doctorName);
            return null;
        }

        IEnumerable<Doctor> IDoctorRespository.GetTopActiveDoctors(int count)
        {
            throw new NotImplementedException();
        }
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
    }
}
