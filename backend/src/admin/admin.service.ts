import { BadRequestException, Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AdminService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  async createUser(body: any) {
    const {
      fullName,
      email,
      password,
      phone,
      role,
      staffNo,
      specialization,
      roomNo,
      department,
      position,
    } = body;

    if (!fullName || !email || !password || !role) {
      throw new BadRequestException('Missing required fields.');
    }

    if (!['doctor', 'staff'].includes(role)) {
      throw new BadRequestException('Only doctor and staff can be created here.');
    }

    const { data: authData, error: authError } =
      await this.supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      throw new BadRequestException(authError.message);
    }

    const userId = authData.user.id;

    const { error: profileError } = await this.supabase.from('profiles').insert({
      id: userId,
      full_name: fullName,
      email,
      phone,
      role,
    });

    if (profileError) {
      throw new BadRequestException(profileError.message);
    }

    if (role === 'doctor') {
      const { error } = await this.supabase.from('doctors').insert({
        id: userId,
        staff_no: staffNo,
        specialization,
        room_no: roomNo,
        is_available: true,
      });

      if (error) throw new BadRequestException(error.message);
    }

    if (role === 'staff') {
      const { error } = await this.supabase.from('staff_members').insert({
        id: userId,
        staff_no: staffNo,
        department,
        position,
      });

      if (error) throw new BadRequestException(error.message);
    }

    return {
      message: `${role} account created successfully`,
      userId,
    };
  }
}