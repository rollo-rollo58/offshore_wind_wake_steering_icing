export type Turbine = {
  turbine_id: string;
  x_m: number;
  y_m: number;
  rotor_diameter_m: number;
  hub_height_m: number;
  rated_power_kw: number;
  thrust_coefficient: number;
  available: boolean;
};

export type Farm = {
  name: string;
  reference_latitude: number;
  reference_longitude: number;
  turbines: Turbine[];
};

export type Scenario = {
  wind_speed_mps: number;
  direction_toward_deg: number;
  turbulence_intensity: number;
  air_density_kg_m3: number;
  air_temperature_c: number;
  relative_humidity_pct: number;
  precipitation_mm_h: number;
  yaw_angles_deg: Record<string, number>;
};

export type TurbineResult = {
  turbine_id: string;
  effective_speed_mps: number;
  gross_power_kw: number;
  net_power_kw: number;
  wake_loss_kw: number;
  yaw_deg: number;
  icing_index: number;
  fatigue_index: number;
};

export type Simulation = {
  scenario: Scenario;
  gross_farm_power_kw: number;
  net_farm_power_kw: number;
  wake_loss_kw: number;
  yaw_loss_kw: number;
  capacity_factor: number;
  turbines: TurbineResult[];
  research_only: boolean;
};

export type Snapshot = {
  observed_at: string;
  tick: number;
  scenario: Scenario;
  summary: {
    net_power_kw: number;
    gross_power_kw: number;
    wake_loss_kw: number;
    yaw_loss_kw: number;
    capacity_factor: number;
  };
  turbines: TurbineResult[];
  research_only: boolean;
};

export type Alert = {
  id: string;
  turbine_id: string;
  category: "icing" | "fatigue" | "low_power";
  severity: "info" | "warning" | "critical";
  value: number;
  message: string;
};

export type Optimization = {
  baseline: Simulation;
  optimized: Simulation;
  gain_kw: number;
  chosen_yaw_deg: Record<string, number>;
  evaluations: number;
  research_only: boolean;
};
