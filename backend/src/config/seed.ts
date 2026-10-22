import bcrypt from 'bcrypt';
import { User, Walker, Dog, Booking } from '../models/associations.js';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('--- Starting PawMate Database Seeding ---');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Seed / Upsert Dog Owner: Alex Morgan
    const [ownerUser] = await User.findOrCreate({
      where: { email: 'alex@pawmate.com' },
      defaults: {
        full_name: 'Alex Morgan',
        email: 'alex@pawmate.com',
        password_hash: passwordHash,
        role: 'owner',
        phone: '(512) 555-0199',
        profile_photo_url:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    });

    // Seed Dog Milo for Alex
    const [miloDog] = await Dog.findOrCreate({
      where: { name: 'Milo', owner_id: ownerUser.id },
      defaults: {
        owner_id: ownerUser.id,
        owner_name: ownerUser.full_name,
        name: 'Milo',
        breed: 'Golden Retriever',
        age_years: 3,
        notes: 'Friendly, energetic pup! Loves fetch and trail strolls. Milo is well trained.',
      },
    });

    // 2. Walker Profiles Data matching screenshot UI
    const walkersData = [
      {
        email: 'sarah@pawmate.com',
        name: 'Sarah Jenkins',
        photo_url:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        bio: 'Certified dog trainer & lover with 6+ years experience walking energetic pups, seniors, and rescue dogs in central parks. First-aid certified.',
        rating: 4.9,
        review_count: 128,
        distance_km: 0.8,
        price_per_hour: 24.0,
        playtime_price: 20.0,
        specialty_tag: 'TOP RATED',
        badge_type: 'check',
        experience: '6+ Years',
        walks_completed: '1,420+',
        safety_cert: 'CPR Cert',
        tags: ['Central Parks', 'Top Rated'],
        available: true,
      },
      {
        email: 'marcus@pawmate.com',
        name: 'Marcus Vance',
        photo_url:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        bio: 'Experienced large dog handler and agility coach with 5+ years working with active breeds in local parks.',
        rating: 4.8,
        review_count: 95,
        distance_km: 1.2,
        price_per_hour: 22.0,
        playtime_price: 18.0,
        specialty_tag: 'Large Dog Expert',
        badge_type: 'check',
        experience: '5+ Years',
        walks_completed: '980+',
        safety_cert: 'CPR Cert',
        tags: ['Downtown', 'Large Dogs'],
        available: true,
      },
      {
        email: 'elena@pawmate.com',
        name: 'Elena Rostova',
        photo_url:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        bio: 'Veterinary technician and gentle dog enthusiast specializing in nervous pups and medical needs.',
        rating: 5.0,
        review_count: 210,
        distance_km: 1.5,
        price_per_hour: 28.0,
        playtime_price: 22.0,
        specialty_tag: 'VET TECH',
        badge_type: 'vet',
        experience: '7+ Years',
        walks_completed: '2,100+',
        safety_cert: 'Vet Tech Cert',
        tags: ['Rainey St', 'Vet Tech'],
        available: true,
      },
      {
        email: 'david@pawmate.com',
        name: 'David Miller',
        photo_url:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        bio: 'Gentle puppy coach focused on early socialization, loose-leash walking, and calm positive reinforcement routines.',
        rating: 4.9,
        review_count: 64,
        distance_km: 2.1,
        price_per_hour: 20.0,
        playtime_price: 16.0,
        specialty_tag: 'Puppy Specialist',
        badge_type: 'check',
        experience: '4+ Years',
        walks_completed: '750+',
        safety_cert: 'CPR Cert',
        tags: ['North Loop', 'Puppy Care'],
        available: true,
      },
      {
        email: 'michael@pawmate.com',
        name: 'Michael Chang',
        photo_url:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        bio: 'Patient, active runner who loves giving dogs high-energy, fun adventures around Lady Bird Lake.',
        rating: 5.0,
        review_count: 112,
        distance_km: 1.2,
        price_per_hour: 22.0,
        playtime_price: 18.0,
        specialty_tag: 'Lady Bird Lake',
        badge_type: 'check',
        experience: '5+ Years',
        walks_completed: '1,120+',
        safety_cert: 'CPR Cert',
        tags: ['Lady Bird Lake', 'Trail Runner'],
        available: true,
      },
    ];

    const seededWalkers: Walker[] = [];

    for (const wData of walkersData) {
      // Create user account for walker
      const [walkerUser] = await User.findOrCreate({
        where: { email: wData.email },
        defaults: {
          full_name: wData.name,
          email: wData.email,
          password_hash: passwordHash,
          role: 'walker',
          phone: '(512) 555-0100',
          profile_photo_url: wData.photo_url,
        },
      });

      // Find or create walker profile
      let walker = await Walker.findOne({
        where: { user_id: walkerUser.id },
      });

      if (!walker) {
        walker = await Walker.findOne({
          where: { name: wData.name },
        });
      }

      if (walker) {
        // Update to match latest details
        await walker.update({
          user_id: walkerUser.id,
          name: wData.name,
          photo_url: wData.photo_url,
          bio: wData.bio,
          rating: wData.rating,
          review_count: wData.review_count,
          distance_km: wData.distance_km,
          price_per_hour: wData.price_per_hour,
          playtime_price: wData.playtime_price,
          specialty_tag: wData.specialty_tag,
          badge_type: wData.badge_type,
          experience: wData.experience,
          walks_completed: wData.walks_completed,
          safety_cert: wData.safety_cert,
          tags: wData.tags,
          available: wData.available,
        });
      } else {
        walker = await Walker.create({
          user_id: walkerUser.id,
          name: wData.name,
          photo_url: wData.photo_url,
          bio: wData.bio,
          rating: wData.rating,
          review_count: wData.review_count,
          distance_km: wData.distance_km,
          price_per_hour: wData.price_per_hour,
          playtime_price: wData.playtime_price,
          specialty_tag: wData.specialty_tag,
          badge_type: wData.badge_type,
          experience: wData.experience,
          walks_completed: wData.walks_completed,
          safety_cert: wData.safety_cert,
          tags: wData.tags,
          available: wData.available,
        });
      }

      seededWalkers.push(walker);
    }

    // 3. Seed Sample Bookings for Alex & Milo
    if (seededWalkers.length >= 2 && miloDog) {
      const sarahWalker = seededWalkers.find((w) => w.name === 'Sarah Jenkins') || seededWalkers[0];
      const elenaWalker = seededWalkers.find((w) => w.name === 'Elena Rostova') || seededWalkers[1];

      // Booking 1: Confirmed with Sarah Jenkins
      const bookingDate1 = new Date();
      bookingDate1.setDate(bookingDate1.getDate() + 1);
      bookingDate1.setHours(9, 0, 0, 0);

      const existingBooking1 = await Booking.findOne({
        where: {
          dog_id: miloDog.id,
          walker_id: sarahWalker.id,
        },
      });

      if (!existingBooking1) {
        await Booking.create({
          dog_id: miloDog.id,
          walker_id: sarahWalker.id,
          booking_date: bookingDate1,
          duration_hours: 0.5,
          total_price: Number(sarahWalker.price_per_hour),
          status: 'confirmed',
        });
      }

      // Booking 2: Pending with Elena Rostova
      const bookingDate2 = new Date();
      bookingDate2.setDate(bookingDate2.getDate() + 2);
      bookingDate2.setHours(14, 0, 0, 0);

      const existingBooking2 = await Booking.findOne({
        where: {
          dog_id: miloDog.id,
          walker_id: elenaWalker.id,
        },
      });

      if (!existingBooking2) {
        await Booking.create({
          dog_id: miloDog.id,
          walker_id: elenaWalker.id,
          booking_date: bookingDate2,
          duration_hours: 1,
          total_price: Number(elenaWalker.price_per_hour),
          status: 'pending',
        });
      }
    }

    console.log('--- PawMate Database Seeding Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding PawMate database:', error);
  }
};

export default seedDatabase;
